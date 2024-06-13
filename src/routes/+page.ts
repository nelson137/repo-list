import { EndpointErrorReason, endpoint_err, get_response_error } from '$lib/error';
import type { Repo } from '$lib/models/repo';
import type { PageLoad } from './$types';
import type { ResponsePayload as ReposApiPayload } from './api/github/repos/+server';

interface OutData {
    repos: Repo[] | null;
}

export const load = (async ({ fetch, parent }) => {
    const { logged_in } = await parent();

    if (!logged_in) {
        return {
            repos: null,
        };
    }

    const response = await fetch('/api/github/repos');
    if (!response.ok) {
        return endpoint_err(
            response.status,
            EndpointErrorReason.Other,
            await get_response_error(response),
        );
    }

    let payload: ReposApiPayload;
    try {
        payload = (await response.json()) as ReposApiPayload;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown';
        return endpoint_err(500, EndpointErrorReason.Data, `Invalid response: ${message}`);
    }

    if ('repos' in payload) {
        return {
            repos: payload.repos,
        };
    }

    const message = payload.message ?? 'unknown';
    return endpoint_err(
        response.status,
        EndpointErrorReason.Other,
        `An unexpected error occurred while fetching user data: ${message}`,
    );
}) satisfies PageLoad<OutData>;
