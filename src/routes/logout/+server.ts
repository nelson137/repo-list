throw new Error("@migration task: Update +server.js (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");

import * as Cookie from 'cookie';
import type { RequestHandler } from '../$types';

export type HandlerOutput = Record<string, never>;

export const get: RequestHandler<HandlerOutput> = () => ({
    status: 302,
    headers: {
        Location: '/',
        'Set-Cookie': Cookie.serialize('token', '', { maxAge: 0 }),
    },
    body: {},
});
