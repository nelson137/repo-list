import { auth } from '$lib/api/octokit';
import { EndpointErrorReason, endpoint_err, type EndpointErrorBody } from '$lib/error';
import type { RequestEvent } from '@sveltejs/kit';
import * as Cookie from 'cookie';
import type { RequestHandler } from './__types/callback';

export type HandlerOutput = EndpointErrorBody;

export const get: RequestHandler<HandlerOutput> = async ({ url }: RequestEvent) => {
    if (!url.searchParams.has('code'))
        return endpoint_err(500, EndpointErrorReason.Auth_Callback_NoCode);

    const code = url.searchParams.get('code');
    if (!code) return endpoint_err(500, EndpointErrorReason.Auth_Callback_NullCode);

    try {
        const { token } = await auth({
            type: 'oauth-user',
            code,
            state: url.searchParams.get('state') ?? undefined,
        });

        return {
            status: 302,
            headers: {
                'Set-Cookie': Cookie.serialize('token', token, {
                    path: '/',
                    // secure: true, // Only send over https
                    httpOnly: true, // Not accessible via JS on the client
                    // maxAge: 60 * 60 * 24, // Number of secs from receipt it will be deleted // 1 day
                    sameSite: 'lax',
                }),
                Location: '/',
            },
        };
    } catch (error: any) {
        return endpoint_err(401, EndpointErrorReason.Github, error.message);
    }
};
