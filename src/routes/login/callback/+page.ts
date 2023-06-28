import { handle_endpoint_err } from '$lib/error';
import type { LoadEvent } from '@sveltejs/kit';
import type { HandlerOutput } from '../callback';
import type { PageLoad } from '../$types';

type InProps = HandlerOutput;
type OutProps = {};

throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
export const load: PageLoad<InProps, OutProps> = ({ data: props }: LoadEvent) =>
    props.error ? handle_endpoint_err(props.error) : {};
