import { EndpointErrorReason, endpoint_err } from '$lib/error';
import type { Repo } from '$lib/models/repo';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { ResponsePayload as ReposApiPayload } from './api/github/repos/+server';

type OutData = {
    repos: Repo[] | null;
};

export const load = (async ({ fetch, parent }) => {
    const { logged_in } = await parent();

    if (!logged_in) {
        return {
            repos: null,
        };
    }

    let response: Response;
    let payload: ReposApiPayload;
    try {
        response = await fetch('/api/github/repos');
        payload = await response.json();
    } catch (error: any) {
        return endpoint_err(
            500,
            EndpointErrorReason.Other,
            `An unexpected error occurred while fetching user repositories: ${error.message}`,
        );
    }

    if ('repos' in payload) {
        return {
            repos: payload.repos,
        };
    }

    throw error(response.status, payload);
}) satisfies PageLoad<OutData>;
