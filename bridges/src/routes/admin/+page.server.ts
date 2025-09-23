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
    default: async ({ locals }) => {
        locals.pb.authStore.clear();
        locals.user = null;

        throw redirect(303, '/login');
    }
};