import { redirect, error } from '@sveltejs/kit';
import pb from '$lib/pocketbase';

export async function load({ params }) {
  const slug = params.slug;
  console.log("Looking up slug:", slug);

  try {
    const result = await pb.collection('links').getFirstListItem(`slug="${slug}"`);
    console.log("Found link:", result);

    throw redirect(302, result.target);
  } catch (err: any) {
    // rethrow redirects so they don't look like errors
    if (err.status === 302) throw err;

    console.error("Short link not found:", err);
    throw error(404, 'Short link not found');
  }
}
