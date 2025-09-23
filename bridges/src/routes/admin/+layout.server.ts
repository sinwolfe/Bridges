import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    if (!locals.user.isAdmin) {
        throw error(403, 'Forbidden: You do not have access to this page.');
    }

    return {
        user: locals.user
    };
};