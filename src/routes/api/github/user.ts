import { octokitFactory } from '$lib/api/octokit';
import { User } from '$lib/models/user';
import type { RequestEvent, RequestHandlerOutput } from '@sveltejs/kit';
import { ApiErrorReason, type ApiError } from '../_apiError';
import type { RequestHandler } from './__types/user';

export type HandlerOutput = {
    user?: User;
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
        const response = await octokit.rest.users.getAuthenticated();
        const user = User.from_json(response.data);
        return {
            status: 200,
            body: { user },
        };
    } catch (error: any) {
        return err(400, ApiErrorReason.GithubError, error.response.data.message);
    }
};
