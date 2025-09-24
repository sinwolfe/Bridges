import { redirect } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase'; // Make sure you have PocketBase set up
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect user to login if they're not logged in
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  try {
    // Fetch user files from PocketBase
    const filesResponse = await pb.collection('files').getList(1, 100, {
      filter: locals.user?.id ? `owner = "${locals.user.id}"` : '',
      sort: '-created'
    });
    const files = filesResponse.items;

    // Fetch user links from PocketBase
    const linksResponse = await pb.collection('shares').getList(1, 100, {
      filter: locals.user?.id ? `owner = "${locals.user.id}"` : '',
      sort: '-created'
    });
    const links = linksResponse.items;

    // Calculate the dashboard data
    const totalFiles = files.length;
    const totalLinks = links.length;
    const totalViews = links.reduce((acc, link) => acc + (link.view_count || 0), 0);
    const totalDownloads = links.reduce((acc, link) => acc + (link.download_count || 0), 0);

    // Calculate expiring soon (within next 7 days)
    const now = Date.now();
    const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
    const expiringSoon = links.filter(link => 
      link.expires_at && 
      new Date(link.expires_at).getTime() > now && 
      new Date(link.expires_at).getTime() <= sevenDaysFromNow
    ).length;

    // Calculate storage used (assuming each file has a 'size' field)
    const storageUsed = files.reduce((acc, file) => acc + (file.size || 0), 0) / (1024 * 1024); // MB

    return {
      user: locals.user,
      files,
      links,
      storageUsed,
      totalFiles,
      totalLinks,
      totalViews,
      totalDownloads,
      expiringSoon
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw redirect(303, '/error'); // Redirect to an error page or handle error gracefully
  }
};

export const actions: Actions = {
  logout: async ({ locals }) => {
    locals.pb.authStore.clear();
    locals.user = null;

    throw redirect(303, '/login');
  }
};
