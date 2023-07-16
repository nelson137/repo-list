import { EndpointErrorReason, handle_endpoint_err, type EndpointError } from '$lib/error';
import { User } from '$lib/models/user';
import type { LayoutLoad } from './$types';

type OutData = {
    logged_in: boolean;
    user: User | null;
};

export const load = (async ({ fetch }) => {
    let data: any;
    try {
        const response = await fetch('/api/github/user');
        data = await response.json();
    } catch (error: any) {
        return handle_endpoint_err({
            status: 500,
            reason: EndpointErrorReason.Other,
            message: `An unexpected error occurred while fetching user data: ${error.message}`,
        });
    }

    if (data.user) {
        return {
            logged_in: true,
            user: User.from_json(data.user),
        };
    }

    const error: EndpointError = data.error;
    if (error.reason === EndpointErrorReason.Auth_NoToken) {
        return {
            logged_in: false,
            user: null,
        };
    } else {
        return handle_endpoint_err(error);
    }
}) satisfies LayoutLoad<OutData>;
