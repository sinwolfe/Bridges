import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

function computeExpiry(value: string): string | null {
	const now = new Date();
	switch (value) {
		case '1h':
			now.setHours(now.getHours() + 1);
			break;
		case '24h':
			now.setDate(now.getDate() + 1);
			break;
		case '7d':
			now.setDate(now.getDate() + 7);
			break;
		case '30d':
			now.setDate(now.getDate() + 30);
			break;
		case '1y':
			now.setFullYear(now.getFullYear() + 1);
			break;
		case 'forever':
		default:
			return null;
	}
	return now.toISOString();
}

export const actions: Actions = {
	upload: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'You must be logged in to upload files.' });
		}

		const data = await request.formData();
		const file = data.get('file');
		const visibility = data.get('visibility');
		const password = data.get('password');
		const expires = data.get('expires') as string | null;
		const viewOnce = data.get('viewOnce');
		const viewOnceEnabled = viewOnce === 'on';

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { message: 'A file is required.' });
		}
		if (visibility === 'password' && !password) {
			return fail(400, { message: 'A password is required for protected links.' });
		}

		const pbFormData = new FormData();
		pbFormData.append('file', file);
		pbFormData.append('owner', locals.user.id);

		if (expires) {
			const expiryDate = computeExpiry(expires);
			if (expiryDate) {
				pbFormData.append('expires', expiryDate);
			}
		}

		pbFormData.append('viewOnce', viewOnceEnabled ? 'true' : 'false');

		for (const field of ['title', 'tags', 'visibility', 'password']) {
			const value = data.get(field);
			if (value) {
				pbFormData.append(field, value as string);
			}
		}

		if (viewOnceEnabled) {
			pbFormData.append('downloadLimit', '1');
		} else {
			const downloadLimitValue = data.get('downloadLimit') as string;
			const limit = parseInt(downloadLimitValue, 10);

			if (!isNaN(limit) && limit > 0) {
				pbFormData.append('downloadLimit', limit.toString());
			} else {
				pbFormData.append('downloadLimit', '-1');
			}
		}

		try {
			const uploadRecord = await locals.pb.collection('uploads').create(pbFormData);

			let slug = '';
			let created = false;
			while (!created) {
				slug = Math.random().toString(36).substring(2, 8);
				try {
					await locals.pb.collection('links').create({ slug, upload_id: uploadRecord.id });
					created = true;
				} catch (err: any) {
					if (err?.status === 400) {
						console.warn(`Slug ${slug} already exists, retrying...`);
						continue;
					}
					throw err;
				}
			}

			return { success: true, link: `/go/${slug}` };
		} catch (err) {
			console.error('Upload failed:', err);
			const errorMessage = err instanceof Error ? err.message : 'Something went wrong during the upload.';
			return fail(500, { message: errorMessage });
		}
	}
};
