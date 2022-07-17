import * as Cookie from 'cookie';
import type { RequestHandler } from './__types/logout';

export type HandlerOutput = Record<string, never>;

export const get: RequestHandler<HandlerOutput> = () => ({
    status: 302,
    headers: {
        Location: '/',
        'Set-Cookie': Cookie.serialize('token', '', { maxAge: 0 }),
    },
    body: {},
});
