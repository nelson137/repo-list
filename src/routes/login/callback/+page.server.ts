import { auth } from '$lib/api/octokit';
import { EndpointErrorReason, handle_endpoint_err } from '$lib/error';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, cookies }) => {
    if (!url.searchParams.has('code'))
        return handle_endpoint_err(500, EndpointErrorReason.Auth_Callback_NoCode);

    const code = url.searchParams.get('code');
    if (!code)
        return handle_endpoint_err(500, EndpointErrorReason.Auth_Callback_NullCode);

    try {
        const { token } = await auth({
            type: 'oauth-user',
            code,
            state: url.searchParams.get('state') ?? undefined,
        });

        cookies.set('token', token, {
            path: '/',
            // secure: true, // Only send over https
            httpOnly: true, // Not accessible via JS on the client
            // maxAge: 60 * 60 * 24, // Number of secs from receipt it will be deleted // 1 day
            sameSite: 'lax',
        });
    } catch (error: any) {
        const desc = error.response?.data?.error_description;
        return handle_endpoint_err(401, EndpointErrorReason.Github, desc);
    }

    throw redirect(302, '/');
}) satisfies PageServerLoad;
