import { EndpointErrorReason, endpoint_err } from '$lib/error';
import { ApiRepo } from '$lib/models/repo';
import { octokitFactory, type OktokitErrorResponseData } from '$lib/server/api/octokit';
import type { RequestError } from '@octokit/request-error';
import { json } from '@sveltejs/kit';
import { ZodError } from 'zod';
import debug_data from '../../../../../debug_data/repos.json';
import type { RequestHandler } from './$types';

export type ResponsePayload = { repos: ApiRepo[] } | App.Error;

export const GET = (async ({ locals }) => {
    const octokit = octokitFactory(locals.token);
    try {
        if (locals.debug_data) return json({ repos: debug_data });
        const repos_data = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
            per_page: 100,
            affiliation: 'owner',
        });
        const repos = repos_data.map(ApiRepo.parse);
        return json({ repos });
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const message = error.issues
                .map((iss, i) => `(${i + 1}) ${iss.message}: ${path_to_string(iss.path)}`)
                .join('; ');
            return endpoint_err(500, EndpointErrorReason.Data, message);
        } else {
            const data = (error as RequestError).response?.data as OktokitErrorResponseData;
            return endpoint_err(400, EndpointErrorReason.Github, data?.message ?? 'unknown error');
        }
    }
}) satisfies RequestHandler;

function path_to_string(path: (string | number)[]): string {
    return path.map(p => (typeof p === 'number' ? `[${p}]` : `.${p}`)).join('');
}
