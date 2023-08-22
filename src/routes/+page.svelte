<script lang="ts">
    import { type _DragEvent } from '$lib/drag-and-drop';
    import { RepoList } from '$lib/models/repo-list';
    import CreateListDialogTrigger from '$lib/ui/CreateListDialogTrigger.svelte';
    import type { CreateListOkData } from '$lib/ui/events';
    import { onMount } from 'svelte';
    import Modal from 'svelte-simple-modal';
    import type { PageData } from './$types';
    import { page } from '$app/stores';
    import { repo_lists, lists, load_local_storage } from '$lib/stores/repo-lists';
    import RepoListCard from '$lib/ui/RepoListCard.svelte';
    import { Repo } from '$lib/models/repo';

    export let data: PageData;

    onMount(() => {
        load_local_storage(Repo.parse_array($page.data.repos));
    });

    const create_list = (event: CustomEvent<CreateListOkData>) =>
        repo_lists.add_list(RepoList.from(event.detail.name));
</script>

{#if data?.logged_in}
    {#if $lists}
        <div class="create-list-wrapper">
            <div class="create-list">
                <div class="create-list-line-wrapper">
                    <div class="create-list-line" />
                </div>
                <div class="create-list-icon-wrapper">
                    <Modal>
                        <CreateListDialogTrigger on:ok={create_list} />
                    </Modal>
                </div>
            </div>
        </div>

        {#each $lists as list}
            <RepoListCard {list} />
        {/each}
    {/if}
{:else}
    <h1>Please log in.</h1>
{/if}

<style lang="scss">
    .create-list-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: center;

        .create-list {
            width: 90%;
            display: grid;
            grid-template-rows: 1fr;
            grid-template-columns: 1fr;

            > * {
                grid-row: 1;
                grid-column: 1;
                grid-auto-flow: column;
            }

            .create-list-line-wrapper {
                display: flex;
                flex-direction: column;
                justify-content: center;

                .create-list-line {
                    width: 100%;
                    height: 0;
                    border-top: 2px solid var(--color-border-opaque);
                }
            }

            .create-list-icon-wrapper {
                display: flex;
                flex-direction: row;
                justify-content: center;
            }
        }
    }
</style>
