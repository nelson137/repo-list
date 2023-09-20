<script lang="ts">
    import type { LayoutData } from './$types';
    import '../app.css';
    import EditSvg from '$components/svgs/EditSvg.svelte';
    import CheckButton from '$lib/ui/components/CheckButton.svelte';
    import XButton from '$lib/ui/components/XButton.svelte';
    import { fly } from 'svelte/transition';
    import { in_edit_mode, repo_lists } from '$lib/stores/repo-lists';
    import CreateListModal from '$components/modals/CreateListModal.svelte';
    import type { CreateListOkData } from '$lib/ui/events';
    import { RepoList } from '$lib/models/repo-list';
    import { SvelteUIProvider } from '@svelteuidev/core';

    export let data: LayoutData;

    let profile_menu_details: HTMLElement;
    let profile_menu_summary: HTMLElement;
    let profile_menu_popup: HTMLElement;

    const onWindowClick = (event: MouseEvent) => {
        if (!data.logged_in) return;
        let path = event.composedPath();
        if (
            profile_menu_details.hasAttribute('open') &&
            !path.includes(profile_menu_summary) &&
            !path.includes(profile_menu_popup)
        ) {
            profile_menu_details.removeAttribute('open');
        }
    };

    function on_click_edit() {
        repo_lists.start_edit();
    }

    function on_click_new_list(event: CustomEvent<CreateListOkData>) {
        repo_lists.add_list(RepoList.from(event.detail.name));
    }

    function on_click_edit_submit() {
        repo_lists.submit_edit();
    }

    function on_click_edit_cancel() {
        repo_lists.cancel_edit();
    }
</script>

<svelte:window on:click={onWindowClick} />

<svelte:head>
    <!-- TODO: figure out why this doesn't work correctly -->
    <!-- <script type="module" src="./node_modules/@github/details-menu-element/dist/index.js"></script> -->
</svelte:head>

<header>
    <span>Repo List</span>
    <div class="flex-spacer" />
    {#if data.logged_in}
        <div class="edit-controls-container">
            {#if $in_edit_mode}
                <div class="edit-controls" transition:fly={{ x: -16, duration: 200 }}>
                    <CreateListModal on:ok={on_click_new_list} />
                    <div class="edit-controls-spacer" />
                    <CheckButton variant="icon" on:click={on_click_edit_submit} />
                    <XButton variant="icon" on:click={on_click_edit_cancel} />
                </div>
            {:else}
                <button
                    class="edit-button"
                    on:click={on_click_edit}
                    transition:fly={{ x: 16, duration: 200 }}><EditSvg /></button
                >
            {/if}
        </div>

        <details class="profile" bind:this={profile_menu_details}>
            <summary class="dropdown-trigger" bind:this={profile_menu_summary}>
                <img src={data.user?.avatar_url} alt="@{data.user?.login}" />
                <span class="dropdown-caret" />
            </summary>
            <details-menu class="dropdown-menu" role="menu" bind:this={profile_menu_popup}>
                <a class="link" href={data.user?.html_url} target="_blank">@{data.user?.login}</a>
                <div class="dropdown-menu-divider" />
                <a href="/logout" class="link">Sign out</a>
            </details-menu>
        </details>
    {:else}
        <a href="/login" class="login-link">Sign In</a>
    {/if}
</header>

<SvelteUIProvider themeObserver="dark">
    <main>
        <slot />
    </main>
</SvelteUIProvider>

<style lang="scss">
    @use 'global' as *;

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
        gap: 24px;

        .flex-spacer {
            height: 0;
            flex-grow: 1;
        }

        .edit-controls-container {
            display: grid;
            grid: 1fr / 1fr;
            grid-template-areas: 'slot';
            justify-items: end;

            button {
                :global(.icon) {
                    stroke: var(--color-text-secondary);
                }

                &:hover :global(.icon) {
                    stroke: var(--color-text);
                }
            }

            .edit-button {
                // Fix extra height on parent element caused by default display of
                // `inline-block`.
                display: block;

                grid-area: slot;
            }

            .edit-controls {
                grid-area: slot;
                display: flex;
                --gap: 8px;
                gap: var(--gap);

                .edit-controls-spacer {
                    width: 1.5px;
                    margin: 0px var(--gap);
                    background-color: var(--color-border);
                }

                button:hover :global(.icon.icon-check) {
                    stroke: rgba(var(--color-green-500-rgb) / 0.8);
                }

                button:hover :global(.icon.icon-x) {
                    stroke: rgba(var(--color-red-500-rgb) / 0.8);
                }
            }
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
