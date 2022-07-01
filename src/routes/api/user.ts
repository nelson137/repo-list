import { octokit } from '$lib/api/octokit';
import { User } from '$lib/models/user';
import type { RequestEvent } from '@sveltejs/kit';
import type { RequestHandler } from './__types/user';

export type HandlerOutput = User;

export const get: RequestHandler<HandlerOutput> = async (_event: RequestEvent) => {
    const { data } = await octokit.rest.users.getAuthenticated();
    const user = User.from_json(data);
    return {
        status: 200,
        body: user,
    };
};
