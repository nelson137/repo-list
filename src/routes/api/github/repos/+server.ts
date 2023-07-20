import { octokitFactory } from '$lib/api/octokit';
import { EndpointErrorReason, endpoint_err } from '$lib/error';
import { Repo } from '$lib/models/repo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    const octokit = octokitFactory(locals.token!);
    let response;
    try {
        const repos_data = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
            per_page: 100,
            affiliation: 'owner',
        });
        const repos = Repo.from_json_array(repos_data);
        response = { repos };
    } catch (error: any) {
        response = endpoint_err(400, EndpointErrorReason.Github, error.response.data.message);
    }
    return new Response(JSON.stringify(response));
};
