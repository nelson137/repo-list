<script lang="ts">
    import {
        DRAG_DATA__REPO_ID,
        DRAG_DATA__SRC_LIST_ID,
        type _DragEvent,
    } from '$lib/drag-and-drop';
    import type { Repo } from '$lib/models/repo';
    import { ALL_REPOS_LIST_ID } from '$lib/models/repo-list';
    import GitForkSvg from '$lib/ui/svgs/GitForkSvg.svelte';
    import GitStarSvg from '$lib/ui/svgs/GitStarSvg.svelte';
    import { createEventDispatcher } from 'svelte';
    import { fly } from 'svelte/transition';
    import ExternalLink from './svgs/ExternalLink.svelte';

    export let list_id: string;
    export let repo: Repo;

    const dispatch = createEventDispatcher<{ card_drag_end: undefined }>();

    let card_hover = false;
    const card_enter = () => (card_hover = true);
    const card_leave = () => (card_hover = false);

    const drag_start = (event: _DragEvent) => {
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'copyMove';
            event.dataTransfer.dropEffect = list_id === ALL_REPOS_LIST_ID ? 'copy' : 'move';
            event.dataTransfer.setData(DRAG_DATA__REPO_ID, event.currentTarget.id);
            event.dataTransfer.setData(DRAG_DATA__SRC_LIST_ID, list_id);
        }
    };

    const drag_end = (_event: _DragEvent) => dispatch('card_drag_end');
</script>

<div
    id={repo.id.toString()}
    class="card"
    draggable="true"
    on:mouseenter={card_enter}
    on:mouseleave={card_leave}
    on:dragstart={drag_start}
    on:dragend={drag_end}
>
    <div class="card-header">
        <span>{repo.name}</span>
        <div class="open-button-wrapper">
            {#if card_hover}
                <a
                    href={repo.html_url}
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
            <span>{repo.stargazers_count}</span>
        </div>
        <div class="card-content-item">
            <GitForkSvg />
            <span>{repo.forks_count}</span>
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

        &::before,
        &::after {
            content: '';
            position: absolute;
            top: 0;
            height: 100%;
            --width: 2px;
            --indicator-offset: calc(var(--border-width) + var(--width) / 2 + 24px / 2);
            width: var(--width);
            border-radius: calc(var(--width));
            background-color: lightskyblue;
        }

        &::before {
            left: 0;
            transform: translateX(calc(-1 * var(--indicator-offset)));
            display: var(--display-before, none);
            // background-color: lightskyblue;
        }

        &::after {
            right: 0;
            transform: translateX(var(--indicator-offset));
            display: var(--display-after, none);
            // background-color: seagreen;
        }

        &:hover {
            transition: all 0.2s ease-out;
            border-color: var(--color-border-hover);
        }

        .card-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;

            .open-button-wrapper {
                width: 22px;
                height: 22px;
                .open-button {
                    display: block;
                    :global(svg.icon-external-link:hover) {
                        filter: brightness(1.3);
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
    }
</style>
