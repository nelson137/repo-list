import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    const { APP_CLIENT_ID, APP_GITHUB_REDIRECT_BASE_URL } = import.meta.env;
    const gh_auth_params = new URLSearchParams({
        client_id: APP_CLIENT_ID,
        redirect_uri: `${APP_GITHUB_REDIRECT_BASE_URL}/login/callback`,
        state: Math.random().toString(36).slice(2),
    });
    const gh_auth_url = 'https://github.com/login/oauth/authorize?' + gh_auth_params;

    throw redirect(302, gh_auth_url);
};
