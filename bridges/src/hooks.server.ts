import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { PB_URL } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
  const pb = new PocketBase(PB_URL);

  pb.authStore.loadFromCookie(event.request.headers.get('cookie') ?? '');

  event.locals.pb = pb;

  try {
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
    }
    event.locals.user = structuredClone(pb.authStore.record);
  } catch {
    pb.authStore.clear();
    event.locals.user = null;
  }

  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) =>
      name === 'content-type' || name.startsWith('cache-') || name === 'etag'
  });

  const cookie = pb.authStore.exportToCookie({
    httpOnly: true,
    secure: false,
  });
  response.headers.append('set-cookie', cookie);

  return response;
};
