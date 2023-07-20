import { octokitFactory } from '$lib/api/octokit';
import { EndpointErrorReason, endpoint_err } from '$lib/error';
import { User } from '$lib/models/user';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export type ResponsePayload = { user: User } | App.Error;

export const GET = (async ({ locals }) => {
    const octokit = octokitFactory(locals.token!);
    try {
        const users_response = await octokit.rest.users.getAuthenticated();
        const user = User.from_json(users_response.data);
        return json({ user });
    } catch (error: any) {
        return endpoint_err(400, EndpointErrorReason.Github, error.response.data.message);
    }
}) satisfies RequestHandler;
