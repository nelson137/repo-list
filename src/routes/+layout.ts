import { EndpointErrorReason, handle_endpoint_err, type EndpointError } from '$lib/error';
import { User } from '$lib/models/user';
import type { LoadEvent } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

import '../app.css';

type InProps = Record<string, never>;
type OutProps = {
    logged_in: boolean;
    user: User | null;
};

throw new Error("@migration task: Migrate the load function input (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
export const load: LayoutLoad<InProps, OutProps> = async ({ fetch, stuff }: LoadEvent) => {
    stuff.logged_in = false;

    let data: any;
    try {
        const response = await fetch('/api/github/user');
        data = await response.json();
    } catch (error: any) {
        throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
        return handle_endpoint_err({
            status: 500,
            reason: EndpointErrorReason.Other,
            message: `An unexpected error occurred while fetching user data: ${error.message}`,
        });
    }

    if (data.user) {
        stuff.logged_in = true;
        throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
        return {
            stuff,
            props: {
                logged_in: stuff.logged_in,
                user: User.from_json(data.user),
            },
        };
    }

    const error: EndpointError = data.error;
    if (error.reason === EndpointErrorReason.Auth_NoToken) {
        throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
        return {
            stuff,
            props: {
                logged_in: stuff.logged_in,
                user: null,
            },
        };
    } else {
        throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
        return handle_endpoint_err(error);
    }
};
