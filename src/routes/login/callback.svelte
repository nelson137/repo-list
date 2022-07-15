<script lang="ts" context="module">
    import { handle_endpoint_error } from '$lib/error';
    import type { LoadEvent } from '@sveltejs/kit';
    import type { HandlerOutput } from './callback';
    import type { Load } from './__types/callback';

    type InProps = HandlerOutput;
    type OutProps = {};

    export const load: Load<InProps, OutProps> = ({ status, props }: LoadEvent) =>
        props.error ? handle_endpoint_error(status ?? 400, props.error) : {};
</script>
