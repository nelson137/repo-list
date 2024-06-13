import { __GITHUB_CLIENT_ID, __GITHUB_REDIRECT_BASE_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
    const gh_auth_params = new URLSearchParams({
        client_id: __GITHUB_CLIENT_ID,
        redirect_uri: `${__GITHUB_REDIRECT_BASE_URL}/login/callback`,
        state: Math.random().toString(36).slice(2),
    });
    const gh_auth_url = 'https://github.com/login/oauth/authorize?' + gh_auth_params.toString();

    throw redirect(302, gh_auth_url);
};
