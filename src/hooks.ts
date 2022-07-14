import { init } from '$lib/api/octokit';
import type { Handle } from '@sveltejs/kit';
import * as Cookie from 'cookie';
import { ApiErrorReason } from './routes/api/_apiError';

init();

export const handle: Handle = ({ event, resolve }) => {
    const cookies_str = event.request.headers.get('cookie');
    const cookies = cookies_str ? Cookie.parse(cookies_str) : {};

    if (event.url.pathname.startsWith('/api/github') && !cookies.token) {
        return new Response(
            JSON.stringify({
                error: {
                    status: 401,
                    reason: ApiErrorReason.NoToken,
                    message: 'from hooks',
                },
            }),
            { status: 200 }
        );
    }

    event.locals.token = cookies.token;

    return resolve(event);
};
