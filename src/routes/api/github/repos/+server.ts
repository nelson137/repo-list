import { octokitFactory } from '$lib/server/api/octokit';
import { EndpointErrorReason, endpoint_err } from '$lib/error';
import { ApiRepo } from '$lib/models/repo';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ZodError } from 'zod';

export type ResponsePayload = { repos: ApiRepo[] } | App.Error;

export const GET = (async ({ locals }) => {
    const octokit = octokitFactory(locals.token!);
    try {
        const repos_data = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
            per_page: 100,
            affiliation: 'owner',
        });
        const repos = repos_data.map(ApiRepo.parse);
        return json({ repos });
    } catch (error: any) {
        if (error instanceof ZodError) {
            const message = error.issues
                .map((iss, i) => `(${i + 1}) ${iss.message}: ${path_to_string(iss.path)}`)
                .join('; ');
            return endpoint_err(500, EndpointErrorReason.Data, message);
        } else {
            return endpoint_err(400, EndpointErrorReason.Github, error.response.data.message);
        }
    }
}) satisfies RequestHandler;

function path_to_string(path: (string | number)[]): string {
    return path.map(p => typeof p === 'number' ? `[${p}]` : `.${p}`).join('');
}
