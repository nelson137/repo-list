<script lang="ts">
    import type { _DragEvent } from '$lib/ui/drag-and-drop';
    import type { Repo } from '$lib/models/repo';
    import GitForkSvg from '$components/svgs/GitForkSvg.svelte';
    import GitStarSvg from '$components/svgs/GitStarSvg.svelte';
    import { createEventDispatcher } from 'svelte';
    import type { DragSource } from '$lib/stores/repo-drag';
    import { in_edit_mode } from '$lib/stores/repo-lists';
    import { get } from 'svelte/store';

    export let id: string;
    export let list_id: string;
    export let index: number;
    export let repo: Repo;
    export let bulk_delete_selected = false;

    const dispatch = createEventDispatcher<{
        card_drag_start: DragSource;
        card_drag_end: undefined;
    }>();

    let card_dragging = false;

    const drag_start = (event: _DragEvent) => {
        if (!get(in_edit_mode)) {
            event.preventDefault();
            return;
        }

        card_dragging = true;
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
        }
        dispatch('card_drag_start', { list_id, repo_id: id, repo_index: index });
    };

    const drag_end = (_event: _DragEvent) => {
        card_dragging = false;
        dispatch('card_drag_end');
    };
</script>

<a
    data-testid="card"
    class="card"
    class:card_dragging={$in_edit_mode && card_dragging}
    href={$in_edit_mode ? undefined : repo.html_url}
    target="_blank"
    draggable={$in_edit_mode ? 'true' : undefined}
    on:dragstart={drag_start}
    on:dragend={drag_end}
>
    <label>
        <div class="card-header">
            <span class="card-title" data-testid="name">{repo.name}</span>
            {#if $in_edit_mode}
                <input type="checkbox" bind:checked={bulk_delete_selected} />
            {/if}
        </div>
        <div class="card-content">
            <div class="card-content-item">
                <GitStarSvg />
                <span data-testid="stargazers-count">{repo.stargazers_count}</span>
            </div>
            <div class="card-content-item">
                <GitForkSvg />
                <span data-testid="forks-count">{repo.forks_count}</span>
            </div>
        </div>
    </label>
</a>

<style lang="scss">
    @use 'global' as *;

    a {
        text-decoration: none;
    }

    .card {
        display: block;
        box-sizing: border-box;
        width: $repoCardWidth;
        border-radius: 8px;
        background-clip: padding-box;
        --border-width: 2px;
        border: var(--border-width) solid var(--color-border);
        background-color: var(--color-bg-light);
        color: var(--color-text);
        cursor: grab;
        transition: all 0.2s ease-out;
        position: relative;
        user-select: none;

        &:hover {
            transition: all 0.2s ease-out;
            border-color: var(--color-border-hover);
            box-shadow: 0 0 16px #ffffff30;
        }

        &[href]:hover .card-title {
            text-decoration: underline;
        }

        label {
            display: block;
            padding: 16px;
        }

        .card-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;

            .card-title {
                /**
                 * Ideally this would be `contain` but no browsers currently
                 * support it. See MDN for browser support:
                 * https://developer.mozilla.org/en-US/docs/Web/CSS/user-select#browser_compatibility
                 */
                user-select: text;
            }

            input[type='checkbox'] {
                margin: 0px;
                opacity: 40%;
                &:checked {
                    opacity: 100%;
                }
            }
        }

        .card-content {
            width: 100%;
            margin-top: 8px;
            display: flex;
            flex-flow: row wrap;
            justify-content: flex-start;
            gap: 8px;

            .card-content-item {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                padding: 2px 6px;
                border: 1px solid var(--color-border);
                border-radius: 6px;

                & > span {
                    margin-left: 4px;
                }
            }
        }

        &.card_dragging {
            transition: all 0.25s ease-in-out;
            opacity: 40%;
            border: 2px dashed var(--color-border);
            background-color: var(--color-bg-light-translucent);
        }
    }
</style>
