<script lang="ts">
    import type { Repo } from '$lib/models/repo';
    import GitForkSvg from '$lib/ui/svgs/GitForkSvg.svelte';
    import GitStarSvg from '$lib/ui/svgs/GitStarSvg.svelte';
    import { fly } from 'svelte/transition';
    import ArrowRight from './svgs/ArrowRight.svelte';
    import ExternalLink from './svgs/ExternalLink.svelte';

    export let repo: Repo;
    export let option: string;

    let button_hover = false;
    const button_enter = () => (button_hover = true);
    const button_leave = () => (button_hover = false);

    let card_hover = false;
    const card_enter = () => (card_hover = true);
    const card_leave = () => (card_hover = false);
</script>

<div class="card" on:mouseenter={card_enter} on:mouseleave={card_leave}>
    <div class="card-header">
        <span>{repo.name}</span>
        {#if option === '1'}
            <!-- 1: ALWAYS VISIBLE BUTTON WITH TEXT TRANSITION -->
            <a
                href={repo.html_url}
                class="open-button--1"
                on:mouseenter={button_enter}
                on:mouseleave={button_leave}
            >
                {#if button_hover}
                    <span class="svg-wrapper" transition:fly={{ x: -8, duration: 250 }}>
                        <ArrowRight />
                    </span>
                {:else}
                    <span transition:fly={{ x: 8, duration: 250 }}>Open</span>
                {/if}
            </a>
        {:else if option === '2'}
            <!-- 2: BUTTON VISIBLE ON HOVER WITH TRANSITION -->
            <div class="open-button-wrapper--2">
                {#if card_hover}
                    <a
                        href={repo.html_url}
                        class="open-button"
                        transition:fly={{ x: 8, duration: 200 }}
                    >
                        <span>Open</span>
                    </a>
                {/if}
            </div>
        {:else if option === '3'}
            <!-- 3: ICON VISIBLE ON HOVER WITH TRANSITION -->
            <div class="open-button-wrapper--3">
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
        {/if}
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
        border: 2px solid var(--color-border);
        background-color: var(--color-bg-light);
        color: var(--color-text);
        transition: all 0.2s ease-out;

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

            // ALWAYS VISIBLE BUTTON WITH TEXT TRANSITION
            .open-button--1 {
                font-size: 14px;
                background-color: inherit;
                border-radius: 4px;
                border: 1px solid var(--color-border);
                width: 50px;
                height: 26px;

                // Solution of using grid for overlapping transitions:
                // https://imfeld.dev/writing/svelte_overlapping_transitions
                display: grid;
                grid-template-rows: 1fr;
                grid-template-columns: 1fr;

                & > * {
                    grid-row: 1;
                    grid-column: 1;
                    line-height: 26px;
                    text-align: center;
                    vertical-align: center;
                }

                .svg-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }

            // BUTTON VISIBLE ON HOVER WITH TRANSITION
            .open-button-wrapper--2 {
                width: 50px;
                height: 26px;
                .open-button {
                    font-size: 14px;
                    line-height: 26px;
                    text-align: center;
                    background-color: inherit;
                    border-radius: 4px;
                    border: 1px solid var(--color-border);
                    display: block;
                }
            }

            // ICON VISIBLE ON HOVER WITH TRANSITION
            .open-button-wrapper--3 {
                width: 22px;
                height: 22px;
                .open-button {
                    display: block;
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
