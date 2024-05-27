import { __DEBUG_DATA } from '$env/static/private';
import { EndpointErrorReason, endpoint_err_body } from '$lib/error';
import { init } from '$lib/server/api/octokit';
import { json, type Handle } from '@sveltejs/kit';
import * as Cookie from 'cookie';

init();

export const handle = (({ event, resolve }) => {
    event.locals.debug_data = Boolean(__DEBUG_DATA);

    const cookies_str = event.request.headers.get('cookie');
    const cookies = cookies_str ? Cookie.parse(cookies_str) : {};

    if (event.url.pathname.startsWith('/api/github') && !cookies.token) {
        return json(endpoint_err_body(EndpointErrorReason.Auth_NoToken), { status: 401 });
    }

    event.locals.token = cookies.token;

    return resolve(event);
}) satisfies Handle;
