import { EndpointErrorReason, endpoint_err } from '$lib/error';
import type { User } from '$lib/models/user';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { ResponsePayload as UserApiPayload } from './api/github/user/+server';

type OutData = {
    logged_in: boolean;
    user: User | null;
};

export const load = (async ({ fetch, locals }) => {
    if (!locals.token) {
        return {
            logged_in: false,
            user: null,
        };
    }

    let response: Response;
    let payload: UserApiPayload;
    try {
        response = await fetch('/api/github/user');
        payload = await response.json();
    } catch (error: any) {
        return endpoint_err(
            500,
            EndpointErrorReason.Other,
            `An unexpected error occurred while fetching user data: ${error.message}`,
        );
    }

    if ('user' in payload) {
        return {
            logged_in: true,
            user: payload.user,
        };
    }

    throw error(response.status, payload);
}) satisfies LayoutServerLoad<OutData>;
