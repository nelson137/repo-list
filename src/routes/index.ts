import { octokit } from '$lib/api/octokit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Octokit } from 'octokit';
import type { RequestHandler } from './__types/index';

type Endpoint = InstanceType<typeof Octokit>['rest']['users']['getAuthenticated'];
export type HandlerOutput = Awaited<ReturnType<Endpoint>>;

export const get: RequestHandler<HandlerOutput> = async (_event: RequestEvent) => {
    return {
        status: 200,
        body: await octokit.rest.users.getAuthenticated(),
    };
};
