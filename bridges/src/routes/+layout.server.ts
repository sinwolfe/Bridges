import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	const user = locals.user;
	const pathname = url.pathname;

	if (pathname === '/') {
		if (user) {
			throw redirect(303, '/dashboard');
		} else {
			throw redirect(303, '/login');
		}
	}

	if (user && (pathname === '/login' || pathname === '/register')) {
		throw redirect(303, user.isAdmin ? '/admin' : '/dashboard');
	}

	if (
		!user &&
		(pathname.startsWith('/dashboard') ||
			pathname.startsWith('/admin') ||
			pathname.startsWith('/upload') ||
			pathname.startsWith('/links'))
	) {
		throw redirect(303, '/login');
	}

	if (user && !user.isAdmin && pathname.startsWith('/admin')) {
		throw redirect(303, '/dashboard');
	}

	return {
		user: user
	};
};

