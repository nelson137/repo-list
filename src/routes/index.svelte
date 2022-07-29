<script lang="ts" context="module">
    import {
        DRAG_DATA__REPO_ID,
        DRAG_DATA__SRC_LIST_ID,
        Side,
        type _DragEvent,
    } from '$lib/drag-and-drop';
    import { EndpointErrorReason, handle_endpoint_err } from '$lib/error';
    import { Repo } from '$lib/models/repo';
    import { load_repo_lists, RepositoryLists } from '$lib/models/repo-list';
    import type { CardDragStartData } from '$lib/ui/events';
    import RepoCard from '$lib/ui/RepoCard.svelte';
    import { dist, rects_overlap_y } from '$lib/util';
    import type { LoadEvent } from '@sveltejs/kit';
    import { onMount } from 'svelte';
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
     * Whether to disable showing the drag indicator on the right of the previous card (index-1).
     */
    let disable_prev_right = false;
    /**
     * Whether to disable showing the drag indicator on the left of the next card (index+1).
     */
    let disable_next_left = false;

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

    const drag_enter = (event: _DragEvent) => {
        if (!event.dataTransfer) return;
        const types = event.dataTransfer.types;
        if (types.includes(DRAG_DATA__REPO_ID) && types.includes(DRAG_DATA__SRC_LIST_ID)) {
            // Cancel event to accept the drop
            event.preventDefault();
        }
    };

    const drag_leave = (event: _DragEvent) => clear_list_drag_indicators(event.currentTarget);

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
        let closest_i = -1;
        let closest_side = Side.Before;
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
                    (i === drag_start_index ||
                        (closest_is_prev_right && disable_prev_right) ||
                        (closest_is_next_left && disable_next_left))
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
        // event.preventDefault();
        const repo_id = event.dataTransfer?.getData(DRAG_DATA__REPO_ID);
        const repo_name = repo_lists.entries[repo_id ?? '']?.name;
        const src_list_id = event.dataTransfer?.getData(DRAG_DATA__SRC_LIST_ID);
        const cur_list_id = event.currentTarget.id;
        const cur_list = repo_lists.lists[event.currentTarget.id];
        if (!cur_list) return;
        const cur_list_name = cur_list.name;

        console.log(
            cur_list_id === src_list_id
                ? `reorder repo "${repo_name}" in list "${cur_list_name}"`
                : `move/copy repo "${repo_name}" to list "${cur_list_name}"`
        );
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

        const t = children.item(index);
        if (!t) {
            console.error('Failed to get repository card at index:', index);
            return;
        }
        const target = t.getBoundingClientRect();

        const prev = children.item(index - 1)?.getBoundingClientRect();
        disable_prev_right = false;
        if (!!prev) {
            disable_prev_right = rects_overlap_y(prev, target)
                ? prev.x < target.x
                : prev.y < target.y;
        }

        const next = children.item(index + 1)?.getBoundingClientRect();
        disable_next_left = false;
        if (!!next) {
            disable_next_left = rects_overlap_y(target, next)
                ? target.x < next.x
                : target.y < next.y;
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
                        {#each list.repo_ids as r_id, i}
                            <RepoCard
                                list_id={list.id}
                                index={i}
                                repo={repo_lists.get_repo(r_id)}
                                on:card_drag_start={card_drag_start}
                                on:card_drag_end={card_drag_end}
                            />
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
