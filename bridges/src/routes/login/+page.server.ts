import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ClientResponseError } from 'pocketbase';

export const load: PageServerLoad = async ({ locals }) => {
  // send to dashboard if alr logged in	
  if (locals.user) {
    if (locals.user.isAdmin) {
        throw redirect(302, '/admin');
    }
    throw redirect(302, '/dashboard');
  }
  return {};
};

export const actions: Actions = {
  login: async ({ request, locals }) => {
    const form = await request.formData();
    const usernameOrEmail = String(form.get('username') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!usernameOrEmail || !password) {
      return fail(400, { message: 'Missing username or password.' });
    }

    try {
      await locals.pb.collection('users').authWithPassword(usernameOrEmail, password);
    } catch (err) {
      if (err instanceof ClientResponseError && err.status === 400) {
        return fail(400, { message: 'Invalid credentials.' });
      }
      return fail(500, { message: 'Something went wrong on our end. Please try again' });
    }

    if (locals.pb.authStore.record?.isAdmin) {
        throw redirect(303, '/admin');
    }

    throw redirect(303, '/dashboard');
  }
};
