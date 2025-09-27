import PocketBase from 'pocketbase';
import { PUBLIC_PB_URL } from '$env/static/public';

export const pb = new PocketBase(PUBLIC_PB_URL);
export default pb;

// Only run this in the browser
if (typeof document !== "undefined") {
  pb.authStore.loadFromCookie(document.cookie);

  // Optional: save back to cookie on changes
  pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
  });
}
