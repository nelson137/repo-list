import { octokitFactory } from '$lib/api/octokit';
import { EndpointErrorReason, endpoint_err } from '$lib/error';
import { User } from '$lib/models/user';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    const octokit = octokitFactory(locals.token);
    let response;
    try {
        const users_response = await octokit.rest.users.getAuthenticated();
        const user = User.from_json(users_response.data);
        response = { user };
    } catch (error: any) {
        response = endpoint_err(400, EndpointErrorReason.Github, error.response.data.message);
    }
    return new Response(JSON.stringify(response));
};
