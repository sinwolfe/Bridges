// src/routes/go/[slug]/+page.server.ts

import { error, fail, redirect, isRedirect } from '@sveltejs/kit';
import pb from '$lib/pocketbase';

export async function load({ params }) {
    try {
        const link = await pb.collection('links').getFirstListItem(`slug="${params.slug}"`, {
            expand: 'upload_id'
        });

        const upload = link.expand.upload_id;
        if (!upload) throw error(404, 'File record not found for this link.');

        if (upload.expires && new Date() > new Date(upload.expires)) {
            throw error(410, 'This link has expired.');
        }

        // --- CORRECTED CHECK ---
        // A link is only expired if its limit is exactly 0. A limit of -1 is infinite.
        if (upload.downloadLimit === 0) {
            throw error(410, 'This link has reached its download limit.');
        }
        
        if (upload.visibility !== 'password') {
            // --- CORRECTED DECREMENT ---
            // Only decrement if the limit is a positive number (greater than 0).
            if (upload.downloadLimit > 0) {
                await pb.collection('uploads').update(upload.id, { 'downloadLimit-': 1 });
            }
            
            const fileUrl = pb.files.getURL(upload, upload.file);
            throw redirect(302, fileUrl);
        }

        return {
            slug: params.slug,
            fileName: upload.file,
            title: upload.title
        };

    } catch (err: any) {
        if (isRedirect(err)) throw err;
        if (err.status === 410) throw error(err.status, err.body.message);
        console.error("Link lookup error:", err);
        throw error(404, 'This link does not exist.');
    }
}

export const actions = {
    default: async ({ request, params }) => {
        const formData = await request.formData();
        const password = formData.get('password');
        if (!password) return fail(400, { error: 'Password cannot be empty.' });

        try {
            const link = await pb.collection('links').getFirstListItem(`slug="${params.slug}"`);
            if (!link.upload_id) throw new Error("Link record is missing the upload relation.");
            
            const upload = await pb.collection('uploads').getOne(link.upload_id);

            // --- CORRECTED RE-VERIFICATION CHECKS ---
            if (upload.expires && new Date() > new Date(upload.expires)) {
                return fail(410, { error: 'This link has expired.' });
            }
            if (upload.downloadLimit === 0) {
                return fail(410, { error: 'This link has reached its download limit.' });
            }
            if (password !== upload.password) {
                return fail(401, { error: 'Incorrect password. Please try again.' });
            }

            // --- CORRECTED DECREMENT ---
            if (upload.downloadLimit > 0) {
                await pb.collection('uploads').update(upload.id, { 'downloadLimit-': 1 });
            }

            const fileUrl = pb.files.getURL(upload, upload.file);
            throw redirect(303, fileUrl);

        } catch (err: any) {
            if (isRedirect(err)) throw err;
            console.error("ERROR during password verification action:", err);
            return fail(500, { error: 'An server error occurred.' });
        }
    }
};