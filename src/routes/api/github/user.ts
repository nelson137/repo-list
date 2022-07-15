import { octokitFactory } from '$lib/api/octokit';
import { EndpointErrorReason, endpoint_err, type EndpointErrorBody } from '$lib/error';
import { User } from '$lib/models/user';
import type { RequestEvent } from '@sveltejs/kit';
import type { RequestHandler } from './__types/user';

export type HandlerOutput = {
    user?: User;
} & EndpointErrorBody;

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
        return endpoint_err(400, EndpointErrorReason.GithubError, error.response.data.message);
    }
};
