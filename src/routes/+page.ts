import { EndpointErrorReason, handle_endpoint_err } from '$lib/error';
import { Repo } from '$lib/models/repo';
import type { PageLoad } from './$types';

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

    try {
        const response = await fetch('/api/github/repos');
        const data = await response.json();
        if (data.error) return handle_endpoint_err(data.error);
        return {
            repos: Repo.from_json_array(data.repos || []),
        };
    } catch (error: any) {
        return handle_endpoint_err({
            status: 400,
            reason: EndpointErrorReason.Other,
            message: `An unexpected error occurred while fetching user repositories: ${error.message}`,
        });
    }
}) satisfies PageLoad<OutData>;
