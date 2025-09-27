// src/routes/links/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase'; // Ensure PocketBase is set up
import type { PageServerLoad } from './$types';

// Make sure to accept 'url' as an argument here
export const load: PageServerLoad = async ({ locals, url }) => {
  // Redirect user to login if they're not logged in
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  try {
    // Fetch user links from PocketBase's 'links' collection
    // We are now filtering by the 'owner' field on the related 'upload_id' record.
    const linksResponse = await pb.collection('links').getList(1, 100, {
      filter: locals.user?.id ? `upload_id.owner = "${locals.user.id}"` : '',
      sort: '-created'
    });
    const links = linksResponse.items;

    // Get the current origin (e.g., 'http://localhost:5173' or 'https://doggy.onl')
    const origin = url.origin;

    // Return the links and the new 'origin' property to the page component
    return {
      user: locals.user,
      links,
      totalLinks: links.length,
      origin: origin,
    };
  } catch (error) {
    console.error('Error fetching links:', error);
    // Redirect to an error page if data fetching fails
    throw redirect(303, '/error');
  }
};

