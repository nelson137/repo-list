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
    import { ALL_REPOS_LIST_ID, load_repo_lists, RepositoryLists } from '$lib/models/repo-list';
    import type { CardDragStartData } from '$lib/ui/events';
    import RepoCard from '$lib/ui/RepoCard.svelte';
    import { dist } from '$lib/util';
    import type { LoadEvent } from '@sveltejs/kit';
    import { onMount } from 'svelte';
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

    onMount(() => {
        repo_lists = load_repo_lists(repos ?? []);
        // console.log(repo_lists);
        // localStorage.setItem(REPO_LISTS, JSON.stringify(repo_lists));
    });

    const clear_list_drag_indicators = (list: HTMLElement) => {
        for (let c = 0; c < list.children.length; c++) {
            let child = list.children.item(c) as HTMLElement | null;
            child?.style.removeProperty(`--display-${Side.toStr(Side.Before)}`);
            child?.style.removeProperty(`--display-${Side.toStr(Side.After)}`);
        }
    };

    const _element_is_in_list = (o: any): boolean => {
        if (!o || typeof o !== 'object' || !(o.classList ?? true) || !(o.parentElement ?? true))
            return false;
        return o.classList.contains('list') ? true : _element_is_in_list(o.parentElement);
    };

    const drag_enter = (event: _DragEvent) => {
        if (!event.dataTransfer) return;
        const types = event.dataTransfer.types;
        if (types.includes(DRAG_DATA__REPO_ID) && types.includes(DRAG_DATA__SRC_LIST_ID)) {
            // Cancel event to accept the drop
            event.preventDefault();
        }
    };

    const drag_leave = (event: _DragEvent) => {
        if (_element_is_in_list(event.relatedTarget)) return;
        clear_list_drag_indicators(event.currentTarget);
    };

    const drag_over = (event: _DragEvent) => {
        event.preventDefault();

        const list_el = event.currentTarget;
        const list_rect = list_el.getBoundingClientRect();

        // Mouse position from top left of client window
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Determine which child element (card) and side the indicator should be shown
        const children = list_el.children;
        let closest_dist = Number.MAX_SAFE_INTEGER;
        closest_i = -1;
        closest_side = null;
        for (let i = 0; i < children.length; i++) {
            const child = children.item(i) as HTMLElement | null;
            if (!child) continue;

            const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = child;

            // Center of card from top left of client window
            const childCenterX = list_rect.left + offsetLeft + offsetWidth / 2;
            const childCenterY = list_rect.top + offsetTop + offsetHeight / 2;

            const d = dist(childCenterX, childCenterY, mouseX, mouseY);
            if (d < closest_dist) {
                closest_dist = d;
                closest_i = i;
                closest_side = mouseX < childCenterX ? Side.Before : Side.After;
            }
        }
        if (closest_i < 0 || closest_side === null) return;

        // Enable the indicator on the determined card and side, disable all others
        const closest_is_prev_right =
            closest_i === drag_start_index - 1 && closest_side === Side.After;
        const closest_is_next_left =
            closest_i === drag_start_index + 1 && closest_side === Side.Before;
        for (let i = 0; i < children.length; i++) {
            let child = children.item(i) as HTMLElement | null;
            if (i === closest_i) {
                if (
                    list_el.id === drag_src_list_id &&
                    (i === drag_start_index || closest_is_prev_right || closest_is_next_left)
                ) {
                    /**
                     * Do nothing, these conditions should not show an indicator. The else block of
                     * if(i===closest_i) will take care of removing the indicator when the user
                     * drags elsewhere.
                     */
                } else {
                    child?.style.setProperty(`--display-${Side.toStr(closest_side)}`, 'block');
                }
                child?.style.removeProperty(`--display-${Side.toOppositeStr(closest_side)}`);
            } else {
                child?.style.removeProperty(`--display-${Side.toStr(Side.Before)}`);
                child?.style.removeProperty(`--display-${Side.toStr(Side.After)}`);
            }
        }
    };

    const drop = (event: _DragEvent) => {
        const repo_index_str = event.dataTransfer?.getData(DRAG_DATA__REPO_INDEX);
        if (!repo_index_str) {
            console.error('Invalid drop: no repository index');
            return;
        }
        const repo_index = parseInt(repo_index_str);
        if (!repo_index_str) {
            console.error('Invalid drop: invalid repository index:', repo_index_str);
            return;
        }

        const repo_id = event.dataTransfer?.getData(DRAG_DATA__REPO_ID);
        if (!repo_id) {
            console.error('Invalid drop: no repository ID');
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
        const repo_ids = repo_lists.lists[src_list_id].repo_ids;

        if (closest_side === null) {
            console.error('Invalid drop: no closest_side');
        }
        const new_index = closest_i + (closest_side === Side.Before ? 0 : 1);
        if (cur_list_id === src_list_id) {
            // Reorder list
            repo_ids.splice(new_index, 0, repo_ids[repo_index]);
            repo_ids.splice(repo_index + (new_index < repo_index ? 1 : 0), 1);
        } else {
            // Move or copy (if src is the special "All" list) to current list
            const r = repo_lists.lists[src_list_id].repo_ids[repo_index];
            repo_lists.lists[cur_list_id].repo_ids.splice(new_index, 0, r);
            if (src_list_id !== ALL_REPOS_LIST_ID) repo_ids.splice(repo_index, 1);
        }
        repo_lists.lists[src_list_id].repo_ids = repo_ids;

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
        const list_elements = document.getElementsByClassName('list');
        for (let l = 0; l < list_elements.length; l++) {
            const list_el = list_elements.item(l) as HTMLElement | null;
            if (list_el) clear_list_drag_indicators(list_el);
        }
    };
</script>

{#if logged_in}
    {#if repo_lists}
        {#each Object.values(repo_lists.lists) as list}
            <div class="list-wrapper">
                <div class="list-card">
                    <span class="list-title">{list.name}</span>
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

    .list-wrapper {
        display: flex;
        justify-content: center;

        &:nth-of-type(n + 2) {
            margin-top: 48px;
        }

        .list-card {
            border: 1px solid var(--color-border);
            border-radius: 16px;

            .list-title {
                display: block;
                padding: 12px 24px;
                border-bottom: 1px solid var(--color-border);
            }

            .list {
                margin: 0 auto;
                padding: $repoCardGap;
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
