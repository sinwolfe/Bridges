import { redirect } from '@sveltejs/kit';
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
        return { users: [] };
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
        }
    },

    toggleEnable: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get('id') as string;
        try {
            // Enable user by setting disabled = false
            await locals.pb.collection('users').update(id, { disabled: false });
        } catch (err) {
            console.error('Error enabling user:', err);
        }
    },

    toggleDisable: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get('id') as string;
        try {
            // Disable user by setting disabled = true
            await locals.pb.collection('users').update(id, { disabled: true });
        } catch (err) {
            console.error('Error disabling user:', err);
        }
    }
};