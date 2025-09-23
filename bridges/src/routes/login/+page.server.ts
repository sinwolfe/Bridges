import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

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
      return fail(400, { message: 'Invalid credentials.' });
    }

    if (locals.pb.authStore.record?.isAdmin) {
        throw redirect(303, '/admin');
    }

    throw redirect(303, '/dashboard');
  },

  register: async ({ request, locals }) => {
    const form = await request.formData();
    const username = String(form.get('username') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const passwordConfirm = String(form.get('passwordConfirm') ?? '');

    if (!username || !password || !passwordConfirm) {
      return fail(400, { message: 'Please fill in all fields.' });
    }
    if (password !== passwordConfirm) {
      return fail(400, { message: 'Passwords do not match.' });
    }

    try {
      await locals.pb.collection('users').create({
        username,
        password,
        passwordConfirm
      });

      await locals.pb.collection('users').authWithPassword(username, password);
    } catch (err: any) {

      return fail(400, { message: 'Registration failed.', detail: err?.message });
    }

    throw redirect(303, '/dashboard');
  }
};
