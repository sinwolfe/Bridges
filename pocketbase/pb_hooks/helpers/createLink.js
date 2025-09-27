/// pb_hooks/helpers/createLink.js
export default async function createLink(pb, { fileId, owner, slug, visibility, password, expiryAt, viewOnce, downloadLimit }) {
    return await pb.collection('links').create({
      file: fileId,
      owner: owner,
      slug: slug,
      visibility: visibility || 'public',
      password: password || '',
      expiryAt: expiryAt || '',
      viewOnce: viewOnce || false,
      downloadLimit: downloadLimit || null,
      revoked: false,
      downloadCount: 0,
    });
  }
  