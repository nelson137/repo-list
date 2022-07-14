import { octokitFactory } from '$lib/api/octokit';
import { Repo } from '$lib/models/repo';
import type { RequestEvent, RequestHandlerOutput } from '@sveltejs/kit';
import { ApiErrorReason, type ApiError } from '../_apiError';
import type { RequestHandler } from './__types/repos';

export type HandlerOutput = {
    repos?: Repo[];
    error?: ApiError;
};

const err = (
    status: number,
    reason: ApiErrorReason,
    message?: string
): RequestHandlerOutput<HandlerOutput> => {
    return {
        status: 200,
        body: {
            error: {
                status,
                reason,
                message,
            },
        },
    };
};

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
        return err(400, ApiErrorReason.GithubError, error.response.data.message);
    }
};
