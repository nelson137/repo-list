<script lang="ts">
    import { Side, type _DragEvent } from '$lib/drag-and-drop';
    import DeleteListPopupTrigger from '$lib/ui/DeleteListPopupTrigger.svelte';
    import RepoCard from '$lib/ui/RepoCard.svelte';
    import { dist } from '$lib/util';
    import Modal from 'svelte-simple-modal';
    import { flip } from 'svelte/animate';
    import { ALL_REPOS_LIST_ID, repo_lists } from '$lib/stores/repo-lists';
    import type { RepoList } from '$lib/models/repo-list';
    import { repo_drag, type DragSource } from '$lib/stores/repo-drag';
    import { repos } from '$lib/stores/repos';
    import AddRepoModalTrigger from './AddRepoModalTrigger.svelte';

    export let list: RepoList;

    $: is_all_repos_list = list.id === ALL_REPOS_LIST_ID;

    /**
     * Wether a card is being dragged within this list.
     */
    let dragging_in_list = false;

    const add_repos_to_list = (event: CustomEvent<number[]>) =>
        repo_lists.insert_repos(list.id, event.detail);

    const delete_list = (id: string) => repo_lists.delete_list(id);

    const list_set_drag_indicator = (list: HTMLElement, x: number, y: number) => {
        list.style.setProperty('--closest-x', `${x}px`);
        list.style.setProperty('--closest-y', `${y}px`);
        list.style.setProperty('--indicator-display', 'block');
    };

    const list_clear_drag_indicator = (list: HTMLElement) =>
        list.style.removeProperty('--indicator-display');

    const _element_is_in_list = (o: any): boolean => {
        if (!o || typeof o !== 'object' || !(o.classList ?? true) || !(o.parentElement ?? true))
            return false;
        return o.classList.contains('list') || _element_is_in_list(o.parentElement);
    };

    const drag_enter = (event: _DragEvent) => {
        dragging_in_list = true;
        if (is_all_repos_list) {
            return;
        }
        event.preventDefault();
    };

    const drag_leave = (event: _DragEvent) => {
        if (_element_is_in_list(event.relatedTarget)) return;
        dragging_in_list = false;
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
        let closest_i: number | null = null;
        let closest_side: Side | null = null;
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
        if (closest_i === null || closest_side === null) {
            list_set_drag_indicator(list_el, 12, list_rect.height / 2);
            return;
        }

        repo_drag.drag_over(closest_i, closest_side);

        const source = repo_drag.get_drag_source();

        // Enable the indicator on the determined card and side, disable all others
        const closest_is_start_index = closest_i === source.repo_index;
        const closest_is_prev_right =
            closest_i === source.repo_index - 1 && closest_side === Side.After;
        const closest_is_next_left =
            closest_i === source.repo_index + 1 && closest_side === Side.Before;
        if (
            list_el.id === source.list_id &&
            (closest_is_start_index || closest_is_prev_right || closest_is_next_left)
        ) {
            list_clear_drag_indicator(list_el);
        } else {
            list_set_drag_indicator(list_el, indicator_x, indicator_y);
        }
    };

    const drop = (event: _DragEvent) => {
        try {
            const { list_id: src_list_id, repo_id, repo_index } = repo_drag.get_drag_source();

            const src_list = repo_lists.get_list(src_list_id);
            if (!src_list) {
                throw `Invalid drop: source repository list not found: ${src_list_id}`;
            }
            const src_repo_ids = repo_lists.get_list(src_list_id).repo_ids;

            const cur_list_id = event.currentTarget.id;
            const cur_list = repo_lists.get_list(cur_list_id);
            if (!cur_list) {
                throw `Invalid drop: target repository list not found: ${cur_list_id}`;
            }

            const closest = repo_drag.get_indicator_loc();

            if (closest === null && cur_list.repo_ids.length > 0) {
                throw 'Invalid drop: failed to calculate closest_side';
            }
            const new_index = closest ? closest.index + (closest.side === Side.Before ? 0 : 1) : 0;

            if (cur_list_id === src_list_id) {
                // Reorder list
                src_repo_ids.splice(new_index, 0, src_repo_ids[repo_index]);
                src_repo_ids.splice(repo_index + (new_index < repo_index ? 1 : 0), 1);
            } else {
                // Move or copy (if src is the special "All" list) to current list
                repo_lists.get_list(cur_list_id).repo_ids.splice(new_index, 0, repo_id);
                if (src_list_id !== ALL_REPOS_LIST_ID) src_repo_ids.splice(repo_index, 1);
            }

            repo_lists.update_list_repos(src_list_id, src_repo_ids);
        } catch (error) {
            console.error(error);
            return;
        }

        list_clear_drag_indicator(event.currentTarget);
    };

    const card_drag_start = (event: CustomEvent<DragSource>) => {
        repo_drag.drag_start(event.detail);

        const { list_id } = event.detail;
        const children = document.getElementById(list_id)?.children;
        if (!children) {
            console.error('Failed to get list element with id:', list_id);
            return;
        }
    };

    const card_drag_end = (_event: CustomEvent<undefined>) => {
        dragging_in_list = false;
        const list_elements = document.getElementsByClassName('list');
        for (let l = 0; l < list_elements.length; l++) {
            const list_el = list_elements.item(l) as HTMLElement | null;
            if (list_el) list_clear_drag_indicator(list_el);
        }
    };
</script>

<div class="list-wrapper">
    <div class="list-card" class:list-disabled={dragging_in_list && is_all_repos_list}>
        <div class="list-header">
            <span class="list-title">{list.name}</span>
            {#if list.id !== ALL_REPOS_LIST_ID}
                <Modal>
                    <AddRepoModalTrigger list_id={list.id} on:submit={add_repos_to_list} />
                </Modal>
                <Modal>
                    <DeleteListPopupTrigger
                        list_id={list.id}
                        list_name={list.name}
                        on:yes={() => delete_list(list.id)}
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
            role="list"
        >
            {#each list.repo_ids as r_id, i (r_id)}
                <div class="repo-card-wrapper" animate:flip={{ duration: d => Math.sqrt(d * 500) }}>
                    <RepoCard
                        id={r_id}
                        list_id={list.id}
                        index={i}
                        repo={repos.get_repo(r_id)}
                        card_disabled={dragging_in_list && is_all_repos_list}
                        on:card_drag_start={card_drag_start}
                        on:card_drag_end={card_drag_end}
                    />
                </div>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    @import '../../styles/global.scss';

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
                border-bottom: 1px solid var(--color-border);
                justify-content: space-around;
                gap: calc($repoCardGap / 2);
                padding: 0px $repoCardGap;

                .list-title {
                    padding: 12px 0px;
                    flex-grow: 1;
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
            $w: calc($cols * ($repoCardWidth + $repoCardGap) - $repoCardGap);
            .list-header,
            .list {
                width: $w;
            }
        }
    }
</style>
