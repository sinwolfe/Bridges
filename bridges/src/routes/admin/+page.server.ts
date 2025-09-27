import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    try {
        const userRecords = await locals.pb.collection('users').getFullList({
            sort: '-created',
        });
        const users = userRecords.map(record => structuredClone(record));
        return { users };
    } catch (err) {
        console.error('Error fetching users:', err);
        return { users: [], error: 'Could not fetch user data.' };
    }
};

export const actions: Actions = {
    logout: async ({ locals }) => {
        locals.pb.authStore.clear();
        locals.user = null;
        throw redirect(303, '/login');
    },

    toggleAdmin: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get('id') as string;
        const isAdmin = form.get('isAdmin') === 'true';
        try {
            await locals.pb.collection('users').update(id, { isAdmin: !isAdmin });
        } catch (err) {
            console.error('Error toggling admin status:', err);
            return fail(500, { message: 'Failed to toggle admin status.' });
        }
    },

    toggleStatus: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get('id') as string;
        const isDisabled = form.get('disabled') === 'true';

        try {
            await locals.pb.collection('users').update(id, { disabled: !isDisabled });
            return { success: true };
        } catch (err) {
            console.error('Error toggling user status:', err);
            return fail(500, { message: `Failed to update user ${id}.` });
        }
    }
};
