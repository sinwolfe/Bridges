import PocketBase from 'pocketbase';
import { PB_URL } from '$env/static/private';

export const pb = new PocketBase(PB_URL);
export default pb;

// Only run this in the browser
if (typeof document !== "undefined") {
  pb.authStore.loadFromCookie(document.cookie);

  // Optional: save back to cookie on changes
  pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
  });
}
