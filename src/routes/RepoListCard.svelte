<script lang="ts">
    import { type _DragEvent } from '$lib/ui/drag-and-drop';
    import DeleteListModal from '$lib/ui/modals/DeleteListModal.svelte';
    import RepoCard from './RepoCard.svelte';
    import { flip } from 'svelte/animate';
    import { in_edit_mode, repo_lists } from '$lib/stores/repo-lists';
    import type { RepoList } from '$lib/models/repo-list';
    import { repos } from '$lib/stores/repos';
    import AddRepoModal from '$lib/ui/modals/AddRepoModal.svelte';
    import type { AddRepoSubmitData, DeleteListYesData } from '$lib/ui/events';
    import { fly } from 'svelte/transition';
    import RepoListDragContainer from './RepoListDragContainer.svelte';
    import { onMount } from 'svelte';
    import BackspaceSvg from '$lib/ui/svgs/BackspaceSvg.svelte';

    export let list: RepoList;

    let bulk_delete_selection: { [repo_id: string]: boolean } = {};

    $: any_repos_selected = Object.values(bulk_delete_selection).some(v => v);

    onMount(() =>
        in_edit_mode.subscribe(edit_mode => {
            if (edit_mode) {
                // Clear selections when edit mode is enabled
                bulk_delete_selection = {};
            }
        })
    );

    const add_repos_to_list = (event: CustomEvent<AddRepoSubmitData>) =>
        repo_lists.insert_repos(list.id, event.detail.repo_ids);

    const remove_repos_from_list = (_event: MouseEvent) => {
        const selected_repo_ids = Object.entries(bulk_delete_selection)
            .filter(([_id, selected]) => selected)
            .map(([id, _selected]) => id);
        repo_lists.remove_repos(list.id, selected_repo_ids);
    };

    const delete_list = (event: CustomEvent<DeleteListYesData>) =>
        repo_lists.delete_list(event.detail.list_id);
</script>

<div class="list-wrapper">
    <div class="list-card">
        <div class="list-header">
            <span class="list-title">{list.name}</span>
            <div class="list-controls-container">
                {#if $in_edit_mode}
                    <div class="list-controls" transition:fly={{ x: -16, duration: 200 }}>
                        {#if any_repos_selected}
                            <button on:click={remove_repos_from_list}><BackspaceSvg /></button>
                        {/if}
                        <AddRepoModal list_id={list.id} on:submit={add_repos_to_list} />
                        <DeleteListModal
                            list_id={list.id}
                            list_name={list.name}
                            on:yes={delete_list}
                        />
                    </div>
                {/if}
            </div>
        </div>
        <RepoListDragContainer list_id={list.id} let:card_drag_start let:card_drag_end>
            {#each list.repo_ids as r_id, i (r_id)}
                <div class="repo-card-wrapper" animate:flip={{ duration: d => Math.sqrt(d * 500) }}>
                    <RepoCard
                        id={r_id}
                        list_id={list.id}
                        index={i}
                        repo={repos.get_repo(r_id)}
                        bind:bulk_delete_selected={bulk_delete_selection[r_id]}
                        on:card_drag_start={card_drag_start}
                        on:card_drag_end={card_drag_end}
                    />
                </div>
            {/each}
        </RepoListDragContainer>
    </div>
</div>

<style lang="scss">
    @import '../styles/global.scss';

    .list-wrapper {
        display: flex;
        justify-content: center;

        &:nth-of-type(n + 2) {
            margin-top: 48px;
        }

        .list-card {
            border: 1px solid var(--color-border);
            border-radius: 16px;

            .list-header {
                display: flex;
                flex-direction: row;
                border-bottom: 1px solid var(--color-border);
                justify-content: space-around;
                gap: calc($repoCardGap / 2);
                padding: 0px $repoCardGap;

                .list-title {
                    padding: 12px 0px;
                    flex-grow: 1;
                }

                .list-controls-container {
                    display: grid;
                    grid: 1fr / 1fr;
                    grid-template-areas: 'slot';
                    justify-items: end;

                    .list-controls {
                        grid-area: slot;
                        display: flex;
                        flex-direction: row;
                        gap: calc($repoCardGap / 2);
                    }
                }
            }
        }
    }

    /**
     * This is the best approach to a centered flexbox with left-adjusted items.
     * [Source](https://stackoverflow.com/a/32811002/5673922)
     */

    @media screen and (max-width: maxBaseQueryWidth()) {
        :global(.list-card > *) {
            width: listInnerWidth(1);
        }
    }

    @for $cols from 1 through 10 {
        @media screen and (min-width: minSteppedQueryWidth($cols)) {
            :global(.list-card > *) {
                width: listInnerWidth($cols);
            }
        }
    }
</style>
