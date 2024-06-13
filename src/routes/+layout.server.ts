import { EndpointErrorReason, endpoint_err, get_response_error } from '$lib/error';
import type { User } from '$lib/models/user';
import type { LayoutServerLoad } from './$types';
import type { ResponsePayload as UserApiPayload } from './api/github/user/+server';

interface OutData {
    logged_in: boolean;
    user: User | null;
}

export const load = (async ({ fetch, locals }) => {
    if (!locals.token) {
        return {
            logged_in: false,
            user: null,
        };
    }

    const response = await fetch('/api/github/user');
    if (!response.ok) {
        return endpoint_err(
            response.status,
            EndpointErrorReason.Other,
            await get_response_error(response),
        );
    }

    let payload: UserApiPayload;
    try {
        payload = (await response.json()) as UserApiPayload;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown';
        return endpoint_err(500, EndpointErrorReason.Other, `Invalid response: ${message}`);
    }

    if ('user' in payload) {
        return {
            logged_in: true,
            user: payload.user,
        };
    }

    const message = payload.message ?? 'unknown';
    return endpoint_err(
        response.status,
        EndpointErrorReason.Other,
        `An unexpected error occurred while fetching user data: ${message}`,
    );
}) satisfies LayoutServerLoad<OutData>;
