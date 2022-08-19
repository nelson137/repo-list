<script lang="ts" context="module">
    import {
        DRAG_DATA__REPO_ID,
        DRAG_DATA__REPO_INDEX,
        DRAG_DATA__SRC_LIST_ID,
        Side,
        type _DragEvent,
    } from '$lib/drag-and-drop';
    import { EndpointErrorReason, handle_endpoint_err } from '$lib/error';
    import { Repo } from '$lib/models/repo';
    import { ALL_REPOS_LIST_ID, RepoList, RepositoryLists } from '$lib/models/repo-list';
    import CreateListDialogTrigger from '$lib/ui/CreateListDialogTrigger.svelte';
    import DeleteListPopupTrigger from '$lib/ui/DeleteListPopupTrigger.svelte';
    import type { CardDragStartData, CreateListOkData } from '$lib/ui/events';
    import RepoCard from '$lib/ui/RepoCard.svelte';
    import { dist } from '$lib/util';
    import type { LoadEvent } from '@sveltejs/kit';
    import { onMount } from 'svelte';
    import Modal from 'svelte-simple-modal';
    import { flip } from 'svelte/animate';
    import type { Load } from './__types/index';

    type InProps = {};
    type OutProps = {
        logged_in: boolean;
        repos: Repo[] | null;
    };

    export const load: Load<InProps, OutProps> = async ({ fetch, stuff }: LoadEvent) => {
        if (!stuff.logged_in) {
            return {
                props: {
                    logged_in: stuff.logged_in ?? false,
                    repos: null,
                },
            };
        }

        try {
            const response = await fetch('/api/github/repos');
            const data = await response.json();
            if (data.error) return handle_endpoint_err(data.error);
            return {
                props: {
                    logged_in: stuff.logged_in ?? false,
                    repos: Repo.from_json_array(data.repos || []),
                },
            };
        } catch (error: any) {
            return handle_endpoint_err({
                status: 400,
                reason: EndpointErrorReason.Other,
                message: `An unexpected error occurred while fetching user repositories: ${error.message}`,
            });
        }
    };
</script>

<script lang="ts">
    interface $$Props extends OutProps {}

    export let logged_in: OutProps['logged_in'];
    export let repos: OutProps['repos'];
    let repo_lists: RepositoryLists;
    let list_wrapper_elements: HTMLElement[] = [];

    /**
     * The element ID of the source list from which the card being dragged.
     */
    let drag_src_list_id: string;
    /**
     * The index of the card being dragged.
     */
    let drag_start_index = -1;
    /**
     * The index of the card closest to the mouse.
     */
    let closest_i = -1;
    /**
     * The side of the closest card that is closest to the mouse.
     */
    let closest_side: Side | null = null;
    /**
     * Whether the list from which the card is being dragged is the special "All" list.
     */
    let dragging_in_list_all = false;

    onMount(() => {
        repo_lists = RepositoryLists.from_local_storage(repos ?? []);
    });

    const create_list = (event: CustomEvent<CreateListOkData>) => {
        const { name } = event.detail;
        const list = new RepoList(name);
        repo_lists.lists[list.id] = list;
        repo_lists.to_local_storage();
    };

    const delete_list = (id: string, index: number) => {
        list_wrapper_elements[index]?.remove();
        repo_lists.delete_list(id);
        repo_lists.to_local_storage();
    };

    const list_clear_drag_indicator = (list: HTMLElement) =>
        list.style.removeProperty('--indicator-display');

    const _element_is_in_list = (o: any): boolean => {
        if (!o || typeof o !== 'object' || !(o.classList ?? true) || !(o.parentElement ?? true))
            return false;
        return o.classList.contains('list') ? true : _element_is_in_list(o.parentElement);
    };

    const drag_enter = (event: _DragEvent) => {
        if (event.currentTarget.id === ALL_REPOS_LIST_ID) {
            dragging_in_list_all = true;
            return;
        }
        event.preventDefault();
    };

    const drag_leave = (event: _DragEvent) => {
        if (_element_is_in_list(event.relatedTarget)) return;
        dragging_in_list_all = false;
        list_clear_drag_indicator(event.currentTarget);
    };

    const drag_over = (event: _DragEvent) => {
        const list_el = event.currentTarget;
        if (list_el.id === ALL_REPOS_LIST_ID) return;

        event.preventDefault();

        const list_rect = list_el.getBoundingClientRect();

        // Mouse position from top left of client window
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Determine which child element (card) and side the indicator should be shown
        const children = list_el.children;
        let closest_dist = Number.MAX_SAFE_INTEGER;
        closest_i = -1;
        closest_side = null;
        let indicator_x = 0;
        let indicator_y = 0;
        for (let i = 0; i < children.length; i++) {
            const child = children.item(i) as HTMLElement | null;
            if (!child) continue;

            const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = child;
            const halfWidth = offsetWidth / 2;
            const halfHeight = offsetHeight / 2;

            // Center of card from top left of client window
            const childCenterX = list_rect.left + offsetLeft + halfWidth;
            const childCenterY = list_rect.top + offsetTop + halfHeight;

            const d = dist(childCenterX, childCenterY, mouseX, mouseY);
            if (d < closest_dist) {
                closest_dist = d;
                closest_i = i;
                closest_side = mouseX < childCenterX ? Side.Before : Side.After;
                indicator_x = childCenterX - list_rect.left;
                indicator_x += (closest_side === Side.Before ? -1 : 1) * (halfWidth + 12);
                indicator_y = childCenterY - list_rect.top;
            }
        }
        if (closest_i < 0 || closest_side === null) {
            list_el.style.setProperty('--closest-x', 12 + 'px');
            list_el.style.setProperty('--closest-y', list_rect.height / 2 + 'px');
            list_el.style.setProperty('--indicator-display', 'block');
            return;
        }

        // Enable the indicator on the determined card and side, disable all others
        const closest_is_prev_right =
            closest_i === drag_start_index - 1 && closest_side === Side.After;
        const closest_is_next_left =
            closest_i === drag_start_index + 1 && closest_side === Side.Before;
        if (
            list_el.id === drag_src_list_id &&
            (closest_i === drag_start_index || closest_is_prev_right || closest_is_next_left)
        ) {
            list_el.style.removeProperty('--indicator-display');
        } else {
            list_el.style.setProperty('--closest-x', indicator_x + 'px');
            list_el.style.setProperty('--closest-y', indicator_y + 'px');
            list_el.style.setProperty('--indicator-display', 'block');
        }
    };

    const drop = (event: _DragEvent) => {
        const repo_index_str = event.dataTransfer?.getData(DRAG_DATA__REPO_INDEX);
        if (!repo_index_str) {
            console.error('Invalid drop: no repository index');
            return;
        }
        const repo_index = parseInt(repo_index_str);
        if (!Number.isSafeInteger(repo_index)) {
            console.error('Invalid drop: invalid repository index:', repo_index_str);
            return;
        }

        const repo_id_str = event.dataTransfer?.getData(DRAG_DATA__REPO_ID);
        if (!repo_id_str) {
            console.error('Invalid drop: no repository ID');
            return;
        }
        const repo_id = parseInt(repo_id_str);
        if (!Number.isSafeInteger(repo_id)) {
            console.error('Invalid drop: invalid repository id:', repo_id_str);
            return;
        }

        const src_list_id = event.dataTransfer?.getData(DRAG_DATA__SRC_LIST_ID);
        if (!src_list_id) {
            console.error('Invalid drop: no source list ID');
            return;
        }

        const cur_list_id = event.currentTarget.id;
        if (!repo_lists.lists[cur_list_id]) {
            console.error('Repository list not found for ID:', cur_list_id);
            return;
        }

        if (!repo_lists.lists[src_list_id]) {
            console.error('Repository list not found for ID:', src_list_id);
            return;
        }
        const src_repo_ids = repo_lists.lists[src_list_id].repo_ids;

        if (closest_side === null && repo_lists.lists[cur_list_id].repo_ids.length > 0) {
            console.error('Invalid drop: no closest_side');
            return;
        }
        const new_index =
            closest_side === null ? 0 : closest_i + (closest_side === Side.Before ? 0 : 1);

        if (cur_list_id === src_list_id) {
            // Reorder list
            src_repo_ids.splice(new_index, 0, src_repo_ids[repo_index]);
            src_repo_ids.splice(repo_index + (new_index < repo_index ? 1 : 0), 1);
        } else {
            // Move or copy (if src is the special "All" list) to current list
            repo_lists.lists[cur_list_id].repo_ids.splice(new_index, 0, repo_id);
            if (src_list_id !== ALL_REPOS_LIST_ID) src_repo_ids.splice(repo_index, 1);
        }

        repo_lists.lists[src_list_id].repo_ids = src_repo_ids;

        repo_lists.to_local_storage();

        closest_i = -1;
        closest_side = null;
    };

    const card_drag_start = (event: CustomEvent<CardDragStartData>) => {
        const { index, list_id } = event.detail;

        drag_src_list_id = list_id;
        drag_start_index = index;

        const children = document.getElementById(list_id)?.children;
        if (!children) {
            console.error('Failed to get list element with id:', list_id);
            return;
        }
    };

    const card_drag_end = (_event: CustomEvent<undefined>) => {
        dragging_in_list_all = false;
        const list_elements = document.getElementsByClassName('list');
        for (let l = 0; l < list_elements.length; l++) {
            const list_el = list_elements.item(l) as HTMLElement | null;
            if (list_el) list_clear_drag_indicator(list_el);
        }
    };
</script>

{#if logged_in}
    {#if repo_lists}
        <div class="create-list-wrapper">
            <div class="create-list-line-wrapper">
                <div class="create-list-line" />
            </div>
            <div class="create-list-icon-wrapper">
                <Modal>
                    <CreateListDialogTrigger on:ok={create_list} />
                </Modal>
            </div>
        </div>

        {#each repo_lists.get_repo_lists() as list, l_i}
            <div class="list-wrapper" bind:this={list_wrapper_elements[l_i]}>
                <div
                    class="list-card"
                    class:list-disabled={list.id === ALL_REPOS_LIST_ID && dragging_in_list_all}
                >
                    <div class="list-header">
                        <span class="list-title">{list.name}</span>
                        {#if list.id !== ALL_REPOS_LIST_ID}
                            <Modal>
                                <DeleteListPopupTrigger
                                    list_id={list.id}
                                    list_name={list.name}
                                    on:yes={() => delete_list(list.id, l_i)}
                                />
                            </Modal>
                        {/if}
                    </div>
                    <div
                        id={list.id}
                        class="list"
                        on:dragenter={drag_enter}
                        on:dragleave={drag_leave}
                        on:dragover={drag_over}
                        on:drop={drop}
                    >
                        {#each list.repo_ids as r_id, i (r_id)}
                            <div
                                class="repo-card-wrapper"
                                animate:flip={{ duration: d => Math.sqrt(d * 500) }}
                            >
                                <RepoCard
                                    list_id={list.id}
                                    index={i}
                                    repo={repo_lists.get_repo(r_id)}
                                    card_disabled={list.id === ALL_REPOS_LIST_ID &&
                                        dragging_in_list_all}
                                    on:card_drag_start={card_drag_start}
                                    on:card_drag_end={card_drag_end}
                                />
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    {/if}
{:else}
    <h1>Please log in.</h1>
{/if}

<style lang="scss">
    @import '../styles/global.scss';

    .create-list-wrapper {
        display: grid;
        grid-template-rows: 1fr;
        grid-template-columns: 1fr;

        & > * {
            grid-row: 1;
            grid-column: 1;
            grid-auto-flow: column;
        }

        .create-list-line-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .create-list-line {
                width: 100%;
                height: 0;
                border-top: 2px solid var(--color-border-opaque);
            }
        }

        .create-list-icon-wrapper {
            display: flex;
            flex-direction: row;
            justify-content: center;
        }
    }

    .list-wrapper {
        display: flex;
        justify-content: center;

        &:nth-of-type(n + 2) {
            margin-top: 48px;
        }

        .list-card {
            border: 1px solid var(--color-border);
            border-radius: 16px;

            &.list-disabled {
                --color-red: rgb(229, 115, 115, 0.2);
                background: repeating-linear-gradient(
                    135deg,
                    transparent,
                    transparent 12px,
                    var(--color-red) 12px,
                    var(--color-red) 24px
                );
            }

            .list-header {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                border-bottom: 1px solid var(--color-border);

                .list-title {
                    padding: 12px 24px;
                }
            }

            .list {
                margin: 0 auto;
                padding: $repoCardGap;
                min-height: 91px;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: $repoCardGap;
                align-content: flex-start;
                align-items: center;

                /**
                 * Set position to non-static so that the list will be the
                 * [offsetParent](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent)
                 * for the cards.
                 */
                position: relative;

                &::before {
                    content: '';
                    display: var(--indicator-display, none);
                    position: absolute;
                    top: var(--closest-y, 0px);
                    left: calc(var(--closest-x, 0px));
                    transform: translate(-50%, -50%);
                    height: 80px;
                    --width: 2px;
                    width: var(--width);
                    border-radius: calc(var(--width));
                    background-color: lightskyblue;
                }
            }
        }
    }

    /**
     * This is the best approach to a centered flexbox with left-adjusted items:
     *     https://stackoverflow.com/a/32811002/5673922
     */
    @for $cols from 1 through 10 {
        @media screen and (min-width: calc($cols * ($repoCardWidth + $repoCardGap) + $repoCardGap + 2 * $mainPadding)) {
            .list {
                width: calc($cols * ($repoCardWidth + $repoCardGap) - $repoCardGap);
            }
        }
    }
</style>
