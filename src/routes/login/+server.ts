throw new Error("@migration task: Update +server.js (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");

import type { RequestHandler } from './$types';

export type HandlerOutput = Record<string, never>;

export const get: RequestHandler<HandlerOutput> = async () => {
    // const { url } = oauth_app_instance.getWebFlowAuthorizationUrl({
    //     // clientId: import.meta.env.APP_CLIENT_ID,
    //     redirectUrl: 'http://localhost:3000/login/callback',
    // });
    // console.log(url);

    const gh_auth_params = new URLSearchParams({
        client_id: import.meta.env.APP_CLIENT_ID,
        redirect_uri: 'http://localhost:3000/login/callback',
        state: Math.random().toString(36).slice(2),
    });
    const gh_auth_url = 'https://github.com/login/oauth/authorize?' + gh_auth_params;

    return {
        status: 302,
        headers: {
            Location: gh_auth_url,
        },
        body: {},
    };
};
