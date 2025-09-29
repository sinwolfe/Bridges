import { fail, redirect } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const data = Object.fromEntries(await request.formData()) as {
			username: string;
			password: string;
			passwordConfirm: string;
		};

		if (data.password !== data.passwordConfirm) {
			return fail(400, {
				errors: { passwordConfirm: 'Passwords do not match.' },
				values: { username: data.username }
			});
		}

		try {
			await locals.pb.collection('users').create({
				username: data.username.trim(),
				password: data.password,
				passwordConfirm: data.passwordConfirm
			});

			await locals.pb.collection('users').authWithPassword(data.username, data.password);

		} catch (e) {
			console.error(e);

			if (e instanceof ClientResponseError) {
				const errors: Record<string, string> = {};
				for (const key in e.response.data) {
					errors[key] = e.response.data[key].message;
				}
				return fail(e.status, {
					errors,
					values: { username: data.username }
				});
			}

			return fail(500, {
				message: 'An unexpected error occurred. Please try again.',
				values: { username: data.username }
			});
		}

		throw redirect(303, '/dashboard');
	}
};