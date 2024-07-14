<script lang="ts">
    import { repo_drag, type DragSource } from '$lib/stores/repo-drag';
    import { repo_lists } from '$lib/stores/repo-lists';
    import { Side, type _DragEvent } from '$lib/drag-and-drop';
    import { dist } from '$lib/util';

    export let list_id: string;

    const list_set_drag_indicator = (list: HTMLElement, x: number, y: number) => {
        list.style.setProperty('--closest-x', `${x}px`);
        list.style.setProperty('--closest-y', `${y}px`);
        list.style.setProperty('--indicator-display', 'block');
    };

    const list_clear_drag_indicator = (list: HTMLElement) =>
        list.style.removeProperty('--indicator-display');

    const _element_is_in_list = (o: null | HTMLElement): boolean => {
        if (!o || typeof o !== 'object' || !(o.classList ?? true) || !(o.parentElement ?? true))
            return false;
        return o.classList.contains('list') || _element_is_in_list(o.parentElement);
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
        const list_elements = document.getElementsByClassName('list');
        for (let l = 0; l < list_elements.length; l++) {
            const list_el = list_elements.item(l) as HTMLElement | null;
            if (list_el) list_clear_drag_indicator(list_el);
        }
    };

    const drag_enter = (event: _DragEvent) => {
        event.preventDefault();
    };

    const drag_leave = (event: _DragEvent) => {
        if (_element_is_in_list(event.relatedTarget as HTMLElement)) return;
        list_clear_drag_indicator(event.currentTarget);
    };

    const drag_over = (event: _DragEvent) => {
        const list_el = event.currentTarget;

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
                // Move to current list
                repo_lists.get_list(cur_list_id).repo_ids.splice(new_index, 0, repo_id);
                src_repo_ids.splice(repo_index, 1);
            }

            repo_lists.update_list_repos(src_list_id, src_repo_ids);
        } catch (error) {
            console.error(error);
            return;
        }

        list_clear_drag_indicator(event.currentTarget);
    };
</script>

<div
    id={list_id}
    class="list"
    on:dragenter={drag_enter}
    on:dragleave={drag_leave}
    on:dragover={drag_over}
    on:drop={drop}
    role="list"
>
    <slot {card_drag_start} {card_drag_end} />
</div>

<style lang="scss">
    @use 'global' as *;

    .list {
        margin: 0 auto;
        padding: $repoCardGap;
        min-height: calc(88px + 2 * $repoCardGap);
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
</style>
