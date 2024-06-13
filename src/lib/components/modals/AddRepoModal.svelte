<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import PlusSvg from '../svgs/PlusSvg.svelte';
    import type { AddRepoModalEvents } from '$lib/events';
    import Svelecte from 'svelecte';
    import CheckButton from '../CheckButton.svelte';
    import XButton from '../XButton.svelte';
    import { repo_lists } from '$lib/stores/repo-lists';
    import { repos } from '$lib/stores/repos';
    import { Modal } from '@svelteuidev/core';

    export let list_id: string;

    const dispatch = createEventDispatcher<AddRepoModalEvents>();

    let opened = false;

    // Hack because some props on `Modal` are typed incorrectly.
    let centered = true as unknown as null;
    const overlayOpacity = 0.4 as unknown as null;

    function on_open() {
        opened = true;
        // TODO: make the dropdown open by default
        // (may have to programmatically click the button)
    }

    let value: typeof options | undefined;

    $: current_repos = new Set(repo_lists.get_list_repo_ids(list_id));
    $: options = repos
        .get_all()
        .filter(r => !current_repos.has(r.id))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(r => ({ value: r, label: r.name }));

    function on_submit() {
        dispatch('submit', { repo_ids: value?.map(x => x.value.id) ?? [] });
        opened = false;
    }
</script>

<button class="trigger" on:click={on_open}>
    <PlusSvg />
</button>

<Modal
    class="app-modal add-repos-modal"
    {opened}
    {centered}
    withCloseButton={false}
    {overlayOpacity}
    on:close={() => (opened = false)}
>
    <form on:submit|preventDefault={on_submit}>
        <Svelecte
            class="svelecte-control control"
            {options}
            valueAsObject
            bind:value
            placeholder="Select repositories to add"
            multiple
            clearable
            selectOnTab="select-navigate"
        >
            <div slot="clear-icon" class="icons-container">
                <XButton variant="colorbox" preventDefault />
                <CheckButton variant="colorbox" type="submit" stopPropagation />
            </div>
        </Svelecte>
    </form>
</Modal>

<style lang="scss">
    button.trigger {
        padding: 4px 0px;

        :global(svg.icon-plus) {
            width: 24px;
            height: 24px;
            stroke: var(--color-text-secondary);
        }

        &:hover :global(svg.icon-plus) {
            stroke: rgba(var(--color-green-500-rgb) / 0.8);
        }
    }

    $modalWrapperVerticalPadding: 48px;
    $selectHeight: 48px;
    $selectDropdownHeight: 256px;

    :global(.app-modal.add-repos-modal) {
        :global(> div[role='presentation']) {
            align-items: flex-start;

            :global(> div) {
                margin-top: calc(
                    50vh - ($selectHeight + $selectDropdownHeight) / 2 -
                        $modalWrapperVerticalPadding
                );
            }

            :global(div[role='dialog']) {
                width: 60%;
                min-width: 300px;
                max-width: 512px;
                padding: 0px;
            }
        }
    }

    form {
        display: flex;
        flex-direction: row;
    }

    :global(div.svelecte-control.control) {
        --sv-bg: var(--color-bg-light);
        --sv-color: var(--color-text);
        --sv-min-height: #{$selectHeight};
        --sv-border-color: var(--color-border);
        --sv-border: 1px solid var(--sv-border-color);
        --sv-active-border: 1px solid var(--color-border-hover);
        --sv-placeholder-color: var(--color-text-translucent);
        --sv-dropdown-height: #{$selectDropdownHeight};
        --sv-item-color: var(--sv-color);
        --sv-item-active-color: var(--sv-item-color);
        --sv-item-active-bg: var(--sv-border-color);
        --sv-item-selected-bg: var(--sv-border-color);
        --sv-item-btn-bg: transparent;
        --sv-item-btn-bg-hover: var(--color-border-hover);
        --sv-item-btn-icon: var(--sv-item-color);
        --sv-highlight-bg: transparent;
        --sv-highlight-color: gold;
    }

    .icons-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        height: 100%;
        margin-right: 4px;
    }
</style>
