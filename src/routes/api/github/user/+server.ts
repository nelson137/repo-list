import { EndpointErrorReason, endpoint_err } from '$lib/error';
import { User } from '$lib/models/user';
import { octokitFactory, type OktokitErrorResponseData } from '$lib/server/api/octokit';
import type { RequestError } from '@octokit/request-error';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export type ResponsePayload = { user: User } | App.Error;

export const GET = (async ({ locals }) => {
    const octokit = octokitFactory(locals.token);
    try {
        const users_response = await octokit.rest.users.getAuthenticated();
        const user = User.parse(users_response.data);
        return json({ user });
    } catch (error: unknown) {
        const data = (error as RequestError).response?.data as OktokitErrorResponseData;
        return endpoint_err(400, EndpointErrorReason.Github, data?.message ?? 'unknown error');
    }
}) satisfies RequestHandler;
