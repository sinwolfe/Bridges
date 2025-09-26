import PocketBase from 'pocketbase';

export const pb = new PocketBase("http://127.0.0.1:8090");
export default pb;

// Only run this in the browser
if (typeof document !== "undefined") {
  pb.authStore.loadFromCookie(document.cookie);

  // Optional: save back to cookie on changes
  pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
  });
}
