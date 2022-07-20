<script lang="ts">
    import type { Repo } from '$lib/models/repo';
    import GitForkSvg from '$lib/ui/svgs/GitForkSvg.svelte';
    import GitStarSvg from '$lib/ui/svgs/GitStarSvg.svelte';
    import { fly } from 'svelte/transition';
    import ExternalLink from './svgs/ExternalLink.svelte';

    export let repo: Repo;

    let card_hover = false;
    const card_enter = () => (card_hover = true);
    const card_leave = () => (card_hover = false);
</script>

<div class="card" on:mouseenter={card_enter} on:mouseleave={card_leave}>
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

            .open-button-wrapper {
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
