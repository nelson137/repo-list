<script lang="ts">
    import { type _DragEvent } from '$lib/ui/drag-and-drop';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { page } from '$app/stores';
    import { lists, load_local_storage, is_edit_mode_dirty } from '$lib/stores/repo-lists';
    import RepoListCard from './RepoListCard.svelte';
    import { Repo } from '$lib/models/repo';
    import DebugDataButtons from '$components/debug/DebugDataButtons.svelte';

    export let data: PageData;

    onMount(() => {
        load_local_storage(Repo.parse_array($page.data.repos));
    });

    function on_before_unload(event: BeforeUnloadEvent) {
        if (!$is_edit_mode_dirty) return;
        event.preventDefault();
        /**
         * Required for browser compatibility.
         * The spec only requires `preventDefault` to trigger the confirmation
         * dialogue, but most browsers don't yet support this. Most browsers
         * still require (the deprecated) `returnValue` be set to a string.
         * See MDN for browser support of `preventDefault`-only activation:
         * https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#browser_compatibility
         */
        return (event.returnValue = '');
    }
</script>

<svelte:window on:beforeunload={on_before_unload} />

{#if data?.logged_in}
    {#each $lists as list}
        <RepoListCard {list} />
    {/each}

    {#if import.meta.env.DEV}
        <div class="dev-container">
            <DebugDataButtons />
        </div>
    {/if}
{:else}
    <h1>Please log in.</h1>
{/if}

<style lang="scss">
    .dev-container {
        position: absolute;
        --gap: 8px;
        top: calc(62px + var(--gap));
        left: var(--gap);
        display: flex;
        flex-direction: row;
        gap: var(--gap);
        align-items: center;
    }
</style>
