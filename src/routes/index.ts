import { octokit, type OctoEndpointData, type OctoRest } from '$lib/api/octokit';
import type { RequestEvent } from '@sveltejs/kit';
import type { RequestHandler } from './__types/index';

export type HandlerOutput = {
    data: OctoEndpointData<OctoRest['users']['getAuthenticated']>;
};

export const get: RequestHandler<HandlerOutput> = async (_event: RequestEvent) => {
    const { data } = await octokit.rest.users.getAuthenticated();
    return {
        status: 200,
        body: { data },
    };
};
