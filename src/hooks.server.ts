import { __DEBUG_DATA } from '$env/static/private';
import { EndpointErrorReason, endpoint_err_body } from '$lib/error';
import { init } from '$lib/server/api/octokit';
import { json, type Handle } from '@sveltejs/kit';
import * as Cookie from 'cookie';
import repos_debug_data from '../debug_data/repos.json';
import user_debug_data from '../debug_data/user.json';

init();

export const handle = (({ event, resolve }) => {
    event.locals.debug_data = Boolean(__DEBUG_DATA);

    if (__DEBUG_DATA) {
        switch (event.url.pathname) {
            case '/api/github/repos':
                return json({ repos: repos_debug_data });
            case '/api/github/user':
                return json({ user: user_debug_data });
        }
    }

    const cookies_str = event.request.headers.get('cookie');
    const cookies = cookies_str ? Cookie.parse(cookies_str) : {};

    if (event.url.pathname.startsWith('/api/github') && !cookies.token) {
        return json(endpoint_err_body(EndpointErrorReason.Auth_NoToken), { status: 401 });
    }

    event.locals.token = cookies.token;

    return resolve(event);
}) satisfies Handle;
