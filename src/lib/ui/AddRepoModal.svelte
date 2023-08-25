<script lang="ts">
    import Svelecte from 'svelecte';
    import { TAB_SELECT_NAVIGATE } from 'svelecte';
    import { repos } from '$lib/stores/repos';
    import CheckSvg from './svgs/CheckSvg.svelte';
    import { ModalAction, set_modal_state } from '$lib/stores/add-repo-modal-state';
    import { getContext, onMount } from 'svelte';
    import type { Context as ModalContext } from 'svelte-simple-modal';
    import { repo_lists } from '$lib/stores/repo-lists';
    import XSvg from './svgs/XSvg.svelte';

    export let list_id: string;

    const { close } = getContext<ModalContext>('simple-modal');

    let select_component: Svelecte;

    $: current_repos = new Set(repo_lists.get_list_repos(list_id));
    $: options = repos
        .get_all()
        .filter(r => !current_repos.has(r.id))
        .map(r => ({ value: r, label: r.name }));

    let value: typeof options | undefined;

    const focus_trigger = document.createElement('input');
    focus_trigger.addEventListener('focus', (event: FocusEvent) => {
        select_component.focus(event);
    });
    const focus = () => focus_trigger.dispatchEvent(new FocusEvent('focus'));

    onMount(() => {
        focus();
    });

    function on_submit(_event: SubmitEvent) {
        const repo_ids = value?.map(x => x.value.id) ?? [];
        set_modal_state(list_id, { action: ModalAction.Submitted, repo_ids });
        close();
    }
</script>

<form on:submit|preventDefault={on_submit}>
    <Svelecte
        bind:this={select_component}
        class="svelecte-control control"
        {options}
        valueAsObject
        bind:value
        placeholder="Select repositories to add"
        multiple
        clearable
        selectOnTab={TAB_SELECT_NAVIGATE}
    >
        <!--
        listOffset={6}
        -->
        <div slot="clear-icon" class="icons-container">
            <button on:click|preventDefault><XSvg /></button>
            <button type="submit" on:click|stopPropagation><CheckSvg /></button>
        </div>
    </Svelecte>
</form>

<style lang="scss">
    form {
        display: flex;
        flex-direction: row;
    }

    :global(div.svelecte-control.control) {
        --sv-bg: var(--color-bg-light);
        --sv-color: var(--color-text);
        --sv-min-height: 48px;
        --sv-border-color: var(--color-border);
        --sv-border: 1px solid var(--sv-border-color);
        --sv-active-border: 1px solid var(--color-border-hover);
        --sv-placeholder-color: var(--color-text-translucent);
        --sv-dropdown-height: 256px;
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

        button {
            background: transparent;
            border: none;
            margin: 0px;
            padding: 4px;
            border-radius: 8px;
            transition: background-color 150ms ease 0ms;

            :global(svg.icon) {
                width: 18px;
                height: 18px;
                stroke: var(--color-text);
                stroke-width: 3px;
            }

            &:hover:has(svg.icon-x) {
                background-color: rgba(var(--color-red-500-rgb) / 0.5);
            }

            &:hover:has(svg.icon-check) {
                background-color: rgba(var(--color-green-500-rgb) / 0.5);
            }
        }
    }
</style>
