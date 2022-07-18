<script lang="ts" context="module">
    import { EndpointErrorReason, handle_endpoint_err, type EndpointError } from '$lib/error';
    import { User } from '$lib/models/user';
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
        } catch (error: any) {
            return handle_endpoint_err({
                status: 500,
                reason: EndpointErrorReason.Other,
                message: `An unexpected error occurred while fetching user data: ${error.message}`,
            });
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
        if (error.reason === EndpointErrorReason.Auth_NoToken) {
            return {
                stuff,
                props: {
                    logged_in: stuff.logged_in,
                    user: null,
                },
            };
        } else {
            return handle_endpoint_err(error);
        }
    };
</script>

<script lang="ts">
    interface $$Props extends OutProps {}

    export let logged_in: OutProps['logged_in'];
    export let user: OutProps['user'];

    let profile_menu_details: HTMLElement;
    let profile_menu_summary: HTMLElement;
    let profile_menu_popup: HTMLElement;

    const onWindowClick = (event: MouseEvent) => {
        let path = event.composedPath();
        if (
            profile_menu_details.hasAttribute('open') &&
            !path.includes(profile_menu_summary) &&
            !path.includes(profile_menu_popup)
        ) {
            profile_menu_details.removeAttribute('open');
        }
    };
</script>

<svelte:window on:click={onWindowClick} />

<svelte:head>
    <!-- TODO: figure out why this doesn't work correctly -->
    <!-- <script type="module" src="./node_modules/@github/details-menu-element/dist/index.js"></script> -->
</svelte:head>

<header>
    <span>GitHub Face</span>
    <div class="flex-spacer" />
    {#if logged_in}
        <details class="profile" bind:this={profile_menu_details}>
            <summary class="dropdown-trigger" bind:this={profile_menu_summary}>
                <img src={user?.avatar_url} alt="@{user?.login}" />
                <span class="dropdown-caret" />
            </summary>
            <details-menu class="dropdown-menu" role="menu" bind:this={profile_menu_popup}>
                <a class="link" href={user?.html_url} target="_blank">@{user?.login}</a>
                <div class="dropdown-menu-divider" />
                <a href="/logout" class="link">Sign out</a>
            </details-menu>
        </details>
    {:else}
        <a href="/login" class="login-link">Sign In</a>
    {/if}
</header>

<main>
    <slot />
</main>

<style lang="scss">
    @import 'src/styles/global.scss';

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

        .login-link {
            margin-right: 16px;
        }

        .profile {
            position: relative;

            .dropdown-trigger {
                display: flex;
                flex-direction: row;
                align-items: center;
                cursor: pointer;

                img {
                    border-radius: 50%;
                    aspect-ratio: 1;
                    width: 24px;
                }

                // TODO: make this look like GitHub's
                .dropdown-caret {
                    display: inline-block;
                    width: 0;
                    height: 0;
                    vertical-align: middle;
                    content: '';
                    border-style: solid;
                    border-width: 4px 4px 0;
                    border-right-color: transparent;
                    border-bottom-color: transparent;
                    border-left-color: transparent;
                    margin: 2px 0 0 4px;
                }
            }

            .dropdown-menu {
                position: absolute;
                right: 0;
                // left: auto;
                z-index: 100;
                width: 180px;
                margin-top: 8px;
                padding: 4px 0;
                background-color: var(--color-bg-medium);
                border-radius: 6px;
                box-shadow: var(--color-shadow-large);

                --color-dropdown-border: rgb(48, 54, 61);
                border: 1px solid var(--color-dropdown-border);

                &::before {
                    position: absolute;
                    top: -16px;
                    right: 15px;
                    display: inline-block;
                    content: '';
                    border: 8px solid transparent;
                    border-bottom-color: var(--color-dropdown-border);
                }

                & > * {
                    display: block;
                    padding: 4px 8px;
                }

                .dropdown-menu-divider {
                    height: 0;
                    width: 100%;
                    padding: 0;
                    margin: 6px 0;
                    border-top: 1px solid var(--color-dropdown-border);
                }

                .link {
                    color: var(--color-text);
                    text-decoration: none;
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }

    main {
        margin: 0;
        padding: $mainPadding;
        box-sizing: border-box;
    }
</style>
