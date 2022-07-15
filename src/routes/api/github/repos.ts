import { octokitFactory } from '$lib/api/octokit';
import { EndpointErrorReason, endpoint_err, type EndpointErrorBody } from '$lib/error';
import { Repo } from '$lib/models/repo';
import type { RequestEvent } from '@sveltejs/kit';
import type { RequestHandler } from './__types/repos';

export type HandlerOutput = {
    repos?: Repo[];
} & EndpointErrorBody;

export const get: RequestHandler<HandlerOutput> = async ({ locals }: RequestEvent) => {
    const octokit = octokitFactory(locals.token);
    try {
        const repos_data = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
            per_page: 100,
            affiliation: 'owner',
        });
        const repos = Repo.from_json_array(repos_data);
        return {
            status: 200,
            body: { repos },
        };
    } catch (error: any) {
        return endpoint_err(400, EndpointErrorReason.GithubError, error.response.data.message);
    }
};
