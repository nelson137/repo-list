import { EndpointErrorReason, endpoint_err } from '$lib/error';
import { auth } from '$lib/server/api/octokit';
import type { RequestError } from '@octokit/request-error';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface AuthErrorData {
    error: string;
    error_description: string;
    error_uri: string;
}

export const load = (async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    if (!code) return endpoint_err(500, EndpointErrorReason.Auth_Callback_InvalidCode);

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
    } catch (error: unknown) {
        console.error(error);
        const data = (error as RequestError).response?.data as AuthErrorData;
        return endpoint_err(401, EndpointErrorReason.Github, data?.error_description);
    }

    throw redirect(302, '/');
}) satisfies PageServerLoad;
