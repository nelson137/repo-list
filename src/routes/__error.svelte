<script lang="ts" context="module">
    import type { LoadEvent } from '@sveltejs/kit';
    import type { HandlerError } from './login/callback';
    import type { Load } from './__types/__error';

    type InProps = {
        error?: string;
    };
    type OutProps = HandlerError;

    const UNKNOWN_ERR_MSG = 'An unknown error occurred';

    export const load: Load<InProps, OutProps> = ({ status: stat, error }: LoadEvent) => {
        const status = stat ?? 400;

        if (!error) {
            return {
                props: {
                    status,
                    message: UNKNOWN_ERR_MSG,
                },
            };
        }

        let err = JSON.parse(error.message);

        let props: any = {
            status,
            message: (err.message as string) ?? UNKNOWN_ERR_MSG,
        };

        return {
            props,
        };
    };
</script>

<script lang="ts">
    interface $$Props extends OutProps {}

    export let status: OutProps['status'];
    export let message: OutProps['message'];
</script>

<h1>{status}</h1>

<h2>{message}</h2>
