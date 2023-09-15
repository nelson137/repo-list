<script lang="ts">
    import { type _DragEvent } from '$lib/ui/drag-and-drop';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { page } from '$app/stores';
    import { lists, load_local_storage, in_edit_mode } from '$lib/stores/repo-lists';
    import RepoListCard from './RepoListCard.svelte';
    import { Repo } from '$lib/models/repo';
    import DebugDataButtons from '$components/debug/DebugDataButtons.svelte';
    import { get } from 'svelte/store';

    export let data: PageData;

    onMount(() => {
        load_local_storage(Repo.parse_array($page.data.repos));
    });

    function on_before_unload(event: BeforeUnloadEvent) {
        if (!get(in_edit_mode)) return;
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
    {#if import.meta.env.DEV}
        <DebugDataButtons />
    {/if}

    {#each $lists as list}
        <RepoListCard {list} />
    {/each}
{:else}
    <h1>Please log in.</h1>
{/if}
