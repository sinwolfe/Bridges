// worker.js
import PocketBase from 'pocketbase'
import cron from 'node-cron'

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL
const ADMIN_PASS  = process.env.PB_ADMIN_PASS

async function cleanup() {
  const pb = new PocketBase(PB_URL)
  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS)

  const nowIso = new Date().toISOString()

  // 1) revoke expired links
  const expired = await pb.collection('links').getFullList({
    filter: `revoked=false && ( (expiryAt != "" && expiryAt < "${nowIso}") || (downloadLimit != null && downloads >= downloadLimit) || (viewOnce = true && downloads > 0) )`,
    $autoCancel: false
  })

  for (const link of expired) {
    await pb.collection('links').update(link.id, { revoked: true })
  }

  // 2) (optional) delete orphan files older than 30 days with no links
  const thirtyDaysAgo = new Date(Date.now() - 30*24*3600*1000).toISOString()
  const orphanFiles = await pb.collection('files').getFullList({
    filter: `linkCount = 0 && created < "${thirtyDaysAgo}"`,
    $autoCancel: false
  })
  for (const f of orphanFiles) {
    try { await pb.collection('files').delete(f.id) } catch {}
  }
}

console.log('Cleanup worker started.')
// run every 15 minutes
cron.schedule('*/15 * * * *', () => {
  cleanup().catch(err => console.error('cleanup error:', err.message))
})

// run immediately on boot
cleanup().catch(err => console.error('cleanup error:', err.message))
