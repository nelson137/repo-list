<script lang="ts">
    import { type _DragEvent } from '$lib/drag-and-drop';
    import DeleteListModal from '$lib/components/modals/DeleteListModal.svelte';
    import RepoCard from './RepoCard.svelte';
    import { flip } from 'svelte/animate';
    import { in_edit_mode, repo_lists } from '$lib/stores/repo-lists';
    import type { RepoList } from '$lib/models/repo-list';
    import { repos } from '$lib/stores/repos';
    import AddRepoModal from '$lib/components/modals/AddRepoModal.svelte';
    import type { AddRepoSubmitData, DeleteListYesData, MoveReposSubmitData } from '$lib/events';
    import { fly } from 'svelte/transition';
    import RepoListDragContainer from './RepoListDragContainer.svelte';
    import { onMount } from 'svelte';
    import BackspaceSvg from '$lib/components/svgs/BackspaceSvg.svelte';
    import PencilSvg from '$lib/components/svgs/PencilSvg.svelte';
    import { TextInput } from '@svelteuidev/core';
    import CheckButton from '$lib/components/CheckButton.svelte';
    import XButton from '$lib/components/XButton.svelte';
    import { clickoutside, focus } from '@svelteuidev/composables';
    import MoveReposModal from '$lib/components/modals/MoveReposModal.svelte';

    export let list: RepoList;

    let selected_repos: Record<string, boolean> = {};

    $: selected_repo_ids = Object.entries(selected_repos)
        .filter(([_id, selected]) => selected)
        .map(([id, _selected]) => id);

    $: any_repos_selected = Object.values(selected_repos).some(v => v);

    onMount(() =>
        in_edit_mode.subscribe(edit_mode => {
            if (edit_mode) {
                // Clear selections when edit mode is enabled
                selected_repos = {};
            } else {
                in_title_edit = false;
            }
        }),
    );

    let in_title_edit = false;
    let title_edit_value = '';

    const start_title_edit = (_event: MouseEvent) => {
        if (!$in_edit_mode) return;

        // Delayed so as not to interfere with the click outside handler
        setTimeout(() => {
            title_edit_value = list.name;
            in_title_edit = true;
        }, 50);
    };

    const submit_title_edit = () => {
        repo_lists.rename_list(list.id, title_edit_value);
        in_title_edit = false;
    };

    const cancel_title_edit = () => {
        in_title_edit = false;
    };

    const title_edit_keyup = ((event: KeyboardEvent) => {
        if (!in_title_edit) return;

        if (event.key === 'Enter') submit_title_edit();
        else if (event.key === 'Escape') cancel_title_edit();
    }) as unknown as (_: CustomEvent) => void;

    const add_repos_to_list = (event: CustomEvent<AddRepoSubmitData>) =>
        repo_lists.insert_repos(list.id, event.detail.repo_ids);

    const remove_repos_from_list = (_event: MouseEvent) => {
        repo_lists.remove_repos(list.id, selected_repo_ids);
    };

    const move_repos_to_list = (event: CustomEvent<MoveReposSubmitData>) => {
        repo_lists.remove_repos(list.id, selected_repo_ids);
        repo_lists.insert_repos(event.detail.list_id, selected_repo_ids);
    };

    const delete_list = (event: CustomEvent<DeleteListYesData>) =>
        repo_lists.delete_list(event.detail.list_id);
</script>

<div class="list-wrapper">
    <div class="list-card">
        <div class="header">
            {#if in_title_edit}
                <div
                    class="title-edit-input"
                    use:clickoutside={{
                        enabled: in_title_edit,
                        callback: cancel_title_edit,
                    }}
                >
                    <TextInput
                        variant="filled"
                        size="sm"
                        bind:value={title_edit_value}
                        on:keyup={title_edit_keyup}
                        use={[[focus]]}
                    />
                </div>
                <div class="title-edit-controls">
                    <CheckButton variant="icon" size={20} on:click={submit_title_edit} />
                    <XButton variant="icon" size={20} on:click={cancel_title_edit} />
                </div>
            {:else}
                <button
                    class="title-container"
                    role={$in_edit_mode ? undefined : 'presentation'}
                    tabindex={$in_edit_mode ? undefined : -1}
                    on:click={start_title_edit}
                >
                    <span>{list.name}</span>
                    {#if $in_edit_mode}
                        <PencilSvg />
                    {/if}
                </button>
                <div class="edit-controls-container">
                    {#if $in_edit_mode}
                        <div class="edit-controls" transition:fly={{ x: -16, duration: 200 }}>
                            {#if any_repos_selected}
                                <button
                                    class="bulk-remove-repos-button"
                                    on:click={remove_repos_from_list}><BackspaceSvg /></button
                                >
                                <MoveReposModal
                                    src_list_id={list.id}
                                    on:submit={move_repos_to_list}
                                />
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
                        bind:bulk_delete_selected={selected_repos[r_id]}
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

            .header {
                display: flex;
                flex-direction: row;
                border-bottom: 1px solid var(--color-border);
                justify-content: space-between;
                align-items: center;
                height: 48px;
                padding: 0px $repoCardGap;

                .title-container {
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

                .edit-controls-container {
                    height: 100%;
                    display: grid;
                    grid: 1fr / 1fr;
                    grid-template-areas: 'slot';
                    justify-items: end;

                    .edit-controls {
                        grid-area: slot;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        gap: 4px;

                        button.bulk-remove-repos-button {
                            padding: 2px 1px;
                            :global(svg.icon-backspace) {
                                width: 30px;
                                height: 28px;
                                stroke: var(--color-text-secondary);
                            }
                            &:hover :global(svg.icon-backspace) {
                                stroke: var(--color-text);
                            }
                        }
                    }
                }

                .title-edit-input {
                    flex: 1;
                    :global(input) {
                        font-size: 16px;
                    }
                }

                .title-edit-controls {
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
