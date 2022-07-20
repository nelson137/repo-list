<script lang="ts" context="module">
    import { EndpointErrorReason, handle_endpoint_err } from '$lib/error';
    import { Repo } from '$lib/models/repo';
    import RepoCard from '$lib/ui/RepoCard.svelte';
    import type { LoadEvent } from '@sveltejs/kit';
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
</script>

{#if logged_in}
    <div class="list-wrapper">
        {#if repos && repos.length}
            <div class="list">
                {#each repos as repo}
                    <RepoCard {repo} />
                {/each}
            </div>
        {:else}
            <p>No repositories found.</p>
        {/if}
    </div>
{:else}
    <h1>Please log in.</h1>
{/if}

<style lang="scss">
    @import '../styles/global.scss';

    .list-wrapper {
        display: flex;
        justify-content: center;

        .list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: $repoCardGap;
            align-content: flex-start;
            align-items: center;
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
