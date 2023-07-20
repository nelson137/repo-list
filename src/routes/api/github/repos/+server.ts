import { octokitFactory } from '$lib/api/octokit';
import { EndpointErrorReason, endpoint_err } from '$lib/error';
import { Repo } from '$lib/models/repo';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export type ResponsePayload = { repos: Repo[] } | App.Error;

export const GET = (async ({ locals }) => {
    const octokit = octokitFactory(locals.token!);
    try {
        const repos_data = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
            per_page: 100,
            affiliation: 'owner',
        });
        const repos = Repo.from_json_array(repos_data);
        return json({ repos });
    } catch (error: any) {
        return endpoint_err(400, EndpointErrorReason.Github, error.response.data.message);
    }
}) satisfies RequestHandler;
