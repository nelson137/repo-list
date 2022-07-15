<script lang="ts" context="module">
    import { EndpointErrorReason, type EndpointError } from '$lib/error';
    import { User } from '$lib/models/user';
    import Login from '$lib/ui/Login.svelte';
    import type { LoadEvent } from '@sveltejs/kit';
    import type { Load } from './__types/__layout';

    import '../app.css';

    type InProps = Record<string, never>;
    type OutProps = {
        logged_in: boolean;
        user: User | null;
    };

    export const load: Load<InProps, OutProps> = async ({ fetch, stuff }: LoadEvent) => {
        stuff.logged_in = false;

        let data: any;
        try {
            const response = await fetch('/api/github/user');
            data = await response.json();
        } catch (error) {
            return {
                status: 500,
                error: JSON.stringify({
                    status: 500,
                    message: 'An unexpected error occurred while fetching user repositories.',
                }),
            };
        }

        if (data.user) {
            stuff.logged_in = true;
            return {
                stuff,
                props: {
                    logged_in: stuff.logged_in,
                    user: User.from_json(data.user),
                },
            };
        }

        const error: EndpointError = data.error;
        if (error.reason === EndpointErrorReason.NoToken) {
            return {
                stuff,
                props: {
                    logged_in: stuff.logged_in,
                    user: null,
                },
            };
        } else {
            return {
                status: 400,
                stuff,
                error: JSON.stringify(error),
            };
        }
    };
</script>

<script lang="ts">
    interface $$Props extends OutProps {}

    export let logged_in: OutProps['logged_in'];
    export let user: OutProps['user'];
</script>

<header>
    <span>GitHub Face</span>
    <div class="flex-spacer" />
    {#if logged_in}
        <a href={user?.html_url}>
            <img src={user?.avatar_url} alt="@{user?.login}" />
        </a>
    {:else}
        <div class="login-wrapper">
            <Login />
        </div>
    {/if}
</header>

<main>
    <slot />
</main>

<style lang="scss">
    header {
        background-color: var(--color-bg-medium);
        box-shadow: inset 0 -1px 0 var(--color-border-muted);
        color: var(--color-text);
        box-sizing: border-box;
        height: 62px;
        // padding: 16px 32px;
        padding: 0 32px;
        display: flex;
        align-items: center;

        .flex-spacer {
            height: 0;
            flex-grow: 1;
        }

        .login-wrapper {
            margin-right: 16px;
        }

        a {
            img {
                border-radius: 50%;
                aspect-ratio: 1;
                width: 24px;
            }
        }
    }

    main {
        margin: 0;
        padding: 3em;
        box-sizing: border-box;
    }
</style>
