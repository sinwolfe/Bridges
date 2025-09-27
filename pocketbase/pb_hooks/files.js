/// pb_hooks/files.js
export default function (router, pb) {
    // Increment download counter when a file is downloaded
    router.get('/files/:id/download', async (c) => {
      const id = c.req.param('id');
      const file = await pb.collection('files').getOne(id);
  
      // update counter
      await pb.collection('files').update(id, {
        downloadCount: (file.downloadCount || 0) + 1,
      });
  
      return c.redirect(file.url); // assumes file.url is stored
    });
  
    // Example: tag file
    router.post('/files/:id/tag', async (c) => {
      const id = c.req.param('id');
      const body = await c.req.json();
  
      await pb.collection('files').update(id, {
        tags: body.tags,
      });
  
      return c.json({ success: true });
    });
  }
  