import { init } from '$lib/api/octokit';
import { EndpointErrorReason, endpoint_err_body } from '$lib/error';
import type { Handle } from '@sveltejs/kit';
import * as Cookie from 'cookie';

init();

export const handle: Handle = ({ event, resolve }) => {
    const cookies_str = event.request.headers.get('cookie');
    const cookies = cookies_str ? Cookie.parse(cookies_str) : {};

    if (event.url.pathname.startsWith('/api/github') && !cookies.token) {
        return new Response(
            JSON.stringify(endpoint_err_body(401, EndpointErrorReason.Auth_NoToken)),
            { status: 200 }
        );
    }

    event.locals.token = cookies.token;

    return resolve(event);
};
