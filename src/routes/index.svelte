<script lang="ts" context="module">
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
            if (data.error) {
                return {
                    status: data.error.status ?? 500,
                    error: JSON.stringify(data.error),
                };
            }
            return {
                props: {
                    logged_in: stuff.logged_in ?? false,
                    repos: Repo.from_json_array(data.repos),
                },
            };
        } catch (error) {
            return {
                status: 500,
                error: '{"status":500, "message":"An unexpected error occurred while fetching user repositories."}',
            };
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
    .list-wrapper {
        display: flex;
        justify-content: center;

        .list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 24px;
            align-content: flex-start;
            align-items: center;
        }
    }

    /**
     * This is the best approach to a centered flexbox with left-adjusted items:
     *     https://stackoverflow.com/a/32811002/5673922
     * Wrapper width increases by 316 starting with 292.
     * The max-width in the screen media query is 315 more than the min-width.
     */
    @media screen and (max-width: 703px) {
        .list {
            width: 292px; /* 1 column */
        }
    }
    @media screen and (min-width: 704px) and (max-width: 1019px) {
        .list {
            width: 608px; /* 2 columns */
        }
    }
    @media screen and (min-width: 1020px) and (max-width: 1335px) {
        .list {
            width: 924px; /* 3 columns */
        }
    }
    @media screen and (min-width: 1335px) and (max-width: 1650px) {
        .list {
            width: 1240px; /* 4 columns */
        }
    }
    @media screen and (min-width: 1651px) /* and (max-width: 1966px) */ {
        .list {
            width: 1556px; /* 5 columns */
        }
    }
</style>
