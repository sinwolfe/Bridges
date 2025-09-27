import { fail, error } from '@sveltejs/kit';
import type { Actions } from './$types';

function computeExpiry(value: string): string | null {
    const now = new Date();
    switch (value) {
        case "1h": now.setHours(now.getHours() + 1); break;
        case "24h": now.setDate(now.getDate() + 1); break;
        case "7d": now.setDate(now.getDate() + 7); break;
        case "30d": now.setDate(now.getDate() + 30); break;
        case "1y": now.setFullYear(now.getFullYear() + 1); break;
        case "forever": default: return null;
    }
    return now.toISOString();
}

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'You must be logged in to upload files.');
		}

		const clientFormData = await request.formData();
		const file = clientFormData.get('file');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { message: 'A file is required for upload.' });
		}

		const pbFormData = new FormData();

		pbFormData.append('file', file);
		pbFormData.append('title', clientFormData.get('title') as string || 'Untitled');
		pbFormData.append('tags', clientFormData.get('tags') as string || '');
		pbFormData.append('visibility', clientFormData.get('visibility') as string || 'public');
		pbFormData.append('password', clientFormData.get('password') as string || '');

		const downloadLimit = Number(clientFormData.get('downloadLimit')) || 0;
		pbFormData.append('downloadLimit', (downloadLimit <= 0 ? -1 : downloadLimit).toString());

		pbFormData.append('viewOnce', clientFormData.get('viewOnce') === 'on' ? 'true' : 'false');

		const expires = clientFormData.get('expires') as string;
		const expiryDate = computeExpiry(expires);
		if (expiryDate) {
			pbFormData.append('expires', expiryDate);
		}

		pbFormData.append('owner', locals.user.id);

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
					if (err?.status === 400) continue;
					throw err;
				}
			}

			return {
				success: true,
				link: `/go/${slug}`
			};

		} catch (err) {
			console.error('Upload failed:', err);
			return fail(500, { message: 'Something went wrong on the server. Please try again.' });
		}
	}
};