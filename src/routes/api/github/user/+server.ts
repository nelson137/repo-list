import { EndpointErrorReason, endpoint_err } from '$lib/error';
import { User } from '$lib/models/user';
import { octokitFactory } from '$lib/server/api/octokit';
import { json } from '@sveltejs/kit';
import debug_data from '../../../../../debug_data/user.json';
import type { RequestHandler } from './$types';

export type ResponsePayload = { user: User } | App.Error;

export const GET = (async ({ locals }) => {
    const octokit = octokitFactory(locals.token);
    try {
        if (locals.debug_data) return json({ user: debug_data });
        const users_response = await octokit.rest.users.getAuthenticated();
        const user = User.parse(users_response.data);
        return json({ user });
    } catch (error: any) {
        return endpoint_err(
            400,
            EndpointErrorReason.Github,
            error.response?.data?.message ?? 'unknown error',
        );
    }
}) satisfies RequestHandler;
