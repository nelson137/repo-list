import { octokit } from '$lib/api/octokit';
import { Repo } from '$lib/models/repo';
import type { RequestEvent } from '@sveltejs/kit';
import type { RequestHandler } from './__types/index';

export type HandlerOutput = {
    repos: Repo[];
};

export const get: RequestHandler<HandlerOutput> = async (_event: RequestEvent) => {
    const repos_data = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
        per_page: 100,
        affiliation: 'owner',
    });
    const repos = Repo.from_json_array(repos_data);

    return {
        status: 200,
        body: { repos },
    };
};
