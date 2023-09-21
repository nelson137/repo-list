<script lang="ts">
    import { type _DragEvent } from '$lib/ui/drag-and-drop';
    import DeleteListModal from '$components/modals/DeleteListModal.svelte';
    import RepoCard from './RepoCard.svelte';
    import { flip } from 'svelte/animate';
    import { in_edit_mode, repo_lists } from '$lib/stores/repo-lists';
    import type { RepoList } from '$lib/models/repo-list';
    import { repos } from '$lib/stores/repos';
    import AddRepoModal from '$components/modals/AddRepoModal.svelte';
    import type { AddRepoSubmitData, DeleteListYesData } from '$lib/ui/events';
    import { fly } from 'svelte/transition';
    import RepoListDragContainer from './RepoListDragContainer.svelte';
    import { onMount } from 'svelte';
    import BackspaceSvg from '$components/svgs/BackspaceSvg.svelte';
    import PencilSvg from '$lib/ui/components/svgs/PencilSvg.svelte';
    import { TextInput } from '@svelteuidev/core';
    import CheckButton from '$lib/ui/components/CheckButton.svelte';
    import XButton from '$lib/ui/components/XButton.svelte';
    import { clickoutside, focus } from '@svelteuidev/composables';

    export let list: RepoList;

    let bulk_delete_selection: { [repo_id: string]: boolean } = {};

    $: any_repos_selected = Object.values(bulk_delete_selection).some(v => v);

    onMount(() =>
        in_edit_mode.subscribe(edit_mode => {
            if (edit_mode) {
                // Clear selections when edit mode is enabled
                bulk_delete_selection = {};
            } else {
                in_title_edit = false;
            }
        })
    );

    let in_title_edit = false;
    let title_edit_value = '';

    const start_title_edit = (_event: MouseEvent) => {
        if (!$in_edit_mode) return;

        // Delayed so as not to interfere with the click outside handler
        setTimeout(() => {
            title_edit_value = list.name;
            in_title_edit = true;
        }, 0);
    };

    const submit_title_edit = () => {
        repo_lists.rename_list(list.id, title_edit_value);
        in_title_edit = false;
    };

    const cancel_title_edit = () => {
        in_title_edit = false;
    };

    const title_edit_keyup = ((event: KeyboardEvent) => {
        if (event.key === 'Enter') submit_title_edit();
    }) as unknown as (_: CustomEvent) => void;

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
            {#if in_title_edit}
                <div
                    class="list-title-edit-input"
                    use:clickoutside={{
                        enabled: in_title_edit,
                        callback: cancel_title_edit,
                    }}
                >
                    <TextInput
                        variant="filled"
                        bind:value={title_edit_value}
                        on:keyup={title_edit_keyup}
                        use={[[focus]]}
                    />
                </div>
                <div class="list-title-edit-controls-container">
                    <CheckButton variant="icon" size={20} on:click={submit_title_edit} />
                    <XButton variant="icon" size={20} on:click={cancel_title_edit} />
                </div>
            {:else}
                <button
                    class="list-title-container"
                    role={$in_edit_mode ? undefined : 'presentation'}
                    tabindex={$in_edit_mode ? undefined : -1}
                    on:click={start_title_edit}
                >
                    <span>{list.name}</span>
                    {#if $in_edit_mode}
                        <PencilSvg />
                    {/if}
                </button>
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
            {/if}
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
    @use 'global' as *;

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
                justify-content: space-between;
                align-items: center;
                height: 48px;
                padding: 0px $repoCardGap;

                .list-title-container {
                    display: flex;
                    height: 100%;
                    align-items: center;
                    gap: 8px;

                    // Override browser default size for buttons
                    font-size: 16px;

                    :global(svg.icon-pencil) {
                        width: 18px;
                        height: 18px;
                        stroke: var(--color-text-secondary);
                        transition: stroke 150ms ease-in-out;
                    }

                    &:hover :global(svg.icon-pencil) {
                        stroke: var(--color-text);
                    }
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

                .list-title-edit-input {
                    flex: 1;
                    :global(input) {
                        font-size: 16px;
                    }
                }

                .list-title-edit-controls-container {
                    display: flex;
                    flex-direction: row;
                    gap: 8px;
                    margin-left: 10px;
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
