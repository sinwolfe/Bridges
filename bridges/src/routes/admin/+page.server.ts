import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    try {
        const userRecords = await locals.pb.collection('users').getFullList({
            sort: '-created',
        });

        const users = userRecords.map(record => structuredClone(record));

        return {
            users
        };
    } catch (err) {
        console.error('Error fetching users:', err);
        return {
            users: []
        };
    }
};

export const actions: Actions = {
    logout: async ({ locals }) => {
        locals.pb.authStore.clear();
        locals.user = null;
        throw redirect(303, '/login');
    },

    verify: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get('id') as string;
        try {
            await locals.pb.collection('users').update(id, { isVerified: true });
        } catch (err) {
            console.error('Error verifying user:', err);
        }
    },

    toggleDisable: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get('id') as string;
        const disabled = form.get('disabled') === 'true';
        try {
            await locals.pb.collection('users').update(id, { disabled: !disabled });
        } catch (err) {
            console.error('Error toggling user:', err);
        }
    }
};