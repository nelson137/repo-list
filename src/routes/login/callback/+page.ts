import { handle_endpoint_err } from '$lib/error';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) =>
    data?.error ? handle_endpoint_err(data?.error) : { logged_in: false };
