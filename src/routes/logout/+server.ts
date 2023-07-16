import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = ({ cookies }) => {
    cookies.delete('token', { maxAge: 0 });
    throw redirect(302, '/');
};
