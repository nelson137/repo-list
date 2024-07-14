import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ cookies }) => {
    cookies.delete('token', { path: '/', maxAge: 0 });
    throw redirect(302, '/');
};
