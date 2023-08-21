<script lang="ts">
    import type { _DragEvent } from '$lib/drag-and-drop';
    import type { Repo } from '$lib/models/repo';
    import GitForkSvg from '$lib/ui/svgs/GitForkSvg.svelte';
    import GitStarSvg from '$lib/ui/svgs/GitStarSvg.svelte';
    import { createEventDispatcher } from 'svelte';
    import { fly } from 'svelte/transition';
    import ExternalLink from './svgs/ExternalLink.svelte';
    import type { DragSource } from '$lib/stores/repo-drag';
    import { ALL_REPOS_LIST_ID } from '$lib/stores/repo-lists';

    export let id: number;
    export let list_id: string;
    export let index: number;
    export let repo: Repo;
    export let card_disabled: boolean;

    $: is_in_all_repos_list = list_id === ALL_REPOS_LIST_ID;

    const dispatch = createEventDispatcher<{
        card_drag_start: DragSource;
        card_drag_end: undefined;
    }>();

    let card_hover = false;
    const card_enter = () => (card_hover = true);
    const card_leave = () => (card_hover = false);

    let card_dragging = false;

    const drag_start = (event: _DragEvent) => {
        card_dragging = true;
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = is_in_all_repos_list ? 'copy' : 'move';
        }
        dispatch('card_drag_start', { list_id, repo_id: id, repo_index: index });
    };

    const drag_end = (_event: _DragEvent) => {
        card_dragging = false;
        dispatch('card_drag_end');
    };
</script>

<div
    data-testid="card"
    class="card"
    class:card_dragging
    class:card_disabled
    draggable="true"
    on:mouseenter={card_enter}
    on:mouseleave={card_leave}
    on:dragstart={drag_start}
    on:dragend={drag_end}
    role="listitem"
>
    <div class="card-header">
        <span data-testid="name">{repo.name}</span>
        <div class="open-button-wrapper">
            {#if card_hover}
                <a
                    href={repo.html_url}
                    data-testid="open-link"
                    class="open-button"
                    transition:fly={{ x: 8, duration: 200 }}
                >
                    <ExternalLink />
                </a>
            {/if}
        </div>
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
</div>

<style lang="scss">
    @import 'src/styles/global.scss';

    a {
        text-decoration: none;
    }

    .card {
        box-sizing: border-box;
        width: $repoCardWidth;
        border-radius: 8px;
        padding: 16px;
        background-clip: padding-box;
        --border-width: 2px;
        border: var(--border-width) solid var(--color-border);
        background-color: var(--color-bg-light);
        color: var(--color-text);
        cursor: grab;
        transition: all 0.2s ease-out;
        position: relative;

        &:hover {
            transition: all 0.2s ease-out;
            border-color: var(--color-border-hover);
            box-shadow: 0 0 16px #ffffff30;
        }

        .card-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;

            .open-button-wrapper {
                width: 22px;
                height: 22px;
                flex-shrink: 0;
                .open-button {
                    display: block;
                    :global(svg.icon-external-link) {
                        // Fix for extra height added by an anchor:
                        // https://stackoverflow.com/a/27999850/5673922
                        vertical-align: top;
                        &:hover {
                            filter: brightness(1.3);
                        }
                    }
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

        &.card_disabled {
            opacity: 25%;
        }
    }
</style>
