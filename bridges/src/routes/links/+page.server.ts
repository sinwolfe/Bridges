// src/routes/links/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase'; // Ensure PocketBase is set up
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect user to login if they're not logged in
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  try {
    // Fetch user links from PocketBase's 'shares' collection
    const linksResponse = await pb.collection('shares').getList(1, 100, {
      filter: locals.user?.id ? `owner = "${locals.user.id}"` : '',
      sort: '-created'
    });
    const links = linksResponse.items;

    // Return the links to the page component
    return {
      user: locals.user,
      links,
      totalLinks: links.length
    };
  } catch (error) {
    console.error('Error fetching links:', error);
    // Redirect to an error page if data fetching fails
    throw redirect(303, '/error');
  }
};
