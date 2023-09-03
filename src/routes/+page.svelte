<script lang="ts">
    import { type _DragEvent } from '$lib/drag-and-drop';
    import { RepoList } from '$lib/models/repo-list';
    import CreateListDialogTrigger from './CreateListDialogTrigger.svelte';
    import type { CreateListOkData } from '$lib/ui/events';
    import { onMount } from 'svelte';
    import Modal from 'svelte-simple-modal';
    import type { PageData } from './$types';
    import { page } from '$app/stores';
    import { repo_lists, lists, load_local_storage } from '$lib/stores/repo-lists';
    import RepoListCard from './RepoListCard.svelte';
    import { Repo } from '$lib/models/repo';
    import DebugDataButtons from '$lib/ui/debug/DebugDataButtons.svelte';

    export let data: PageData;

    onMount(() => {
        load_local_storage(Repo.parse_array($page.data.repos));
    });

    const create_list = (event: CustomEvent<CreateListOkData>) =>
        repo_lists.add_list(RepoList.from(event.detail.name));
</script>

{#if data?.logged_in}
    {#if import.meta.env.DEV}
        <DebugDataButtons />
    {/if}

    <Modal>
        <CreateListDialogTrigger on:ok={create_list} />
    </Modal>

    {#each $lists as list}
        <RepoListCard {list} />
    {/each}
{:else}
    <h1>Please log in.</h1>
{/if}
