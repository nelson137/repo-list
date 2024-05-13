<script lang="ts">
    import Svelecte from 'svelecte';
    import { TAB_SELECT_NAVIGATE } from 'svelecte';
    import { repos } from '$lib/stores/repos';
    import CheckButton from '../CheckButton.svelte';
    import XButton from '../XButton.svelte';
    import { getContext, onMount } from 'svelte';
    import type { Context as ModalContext } from 'svelte-simple-modal';
    import { repo_lists } from '$lib/stores/repo-lists';

    export let list_id: string;
    export let on_submit: (repo_ids: string[]) => void;

    const { close } = getContext<ModalContext>('simple-modal');

    let select_component: Svelecte;

    $: current_repos = new Set(repo_lists.get_list_repo_ids(list_id));
    $: options = repos
        .get_all()
        .filter(r => !current_repos.has(r.id))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(r => ({ value: r, label: r.name }));

    let value: typeof options | undefined;

    // Proxy focus event through an invisible input element so that it appears
    // to come from the input element inside the `Svelecte` component.
    const focus_trigger = document.createElement('input');
    focus_trigger.addEventListener('focus', (event: FocusEvent) => {
        select_component.focus(event);
    });
    const focus = () => focus_trigger.dispatchEvent(new FocusEvent('focus'));

    onMount(() => {
        focus();
    });

    function on_submit_form(_event: SubmitEvent) {
        on_submit(value?.map(x => x.value.id) ?? []);
        close();
    }
</script>

<form on:submit|preventDefault={on_submit_form}>
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
        <div slot="clear-icon" class="icons-container">
            <XButton variant="colorbox" preventDefault />
            <CheckButton variant="colorbox" type="submit" stopPropagation />
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
    }
</style>
