<script lang="ts">
    import { createEventDispatcher, tick } from 'svelte';
    import type { MoveReposModalEvents } from '$lib/ui/events';
    import { Modal } from '@svelteuidev/core';
    import SquareRoundedArrowRightSvg from '../svgs/SquareRoundedArrowRightSvg.svelte';
    import Svelecte from 'svelecte';
    import { lists } from '$lib/stores/repo-lists';
    import XButton from '../XButton.svelte';
    import CheckButton from '../CheckButton.svelte';
    import { sineInOut } from 'svelte/easing';

    export let src_list_id: string;

    const dispatch = createEventDispatcher<MoveReposModalEvents>();

    let opened = false;

    // Hack because some props on `Modal` are typed incorrectly.
    let centered = true as unknown as null;
    const overlayOpacity = 0.4 as unknown as null;

    async function on_open() {
        opened = true;
        await tick(); // Wait for the select component to be mounted
        focus();
    }

    function on_close() {
        opened = false;
    }

    let select_component: Svelecte;

    $: options = $lists
        .filter(l => l.id !== src_list_id)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(l => ({ value: l.id, label: l.name }));

    let selected: (typeof options)[number] | undefined;

    const focus_trigger = document.createElement('input');
    focus_trigger.addEventListener('focus', () => select_component.focus());
    function focus() {
        focus_trigger.dispatchEvent(new FocusEvent('focus'));
    }

    function on_submit_form(_event: SubmitEvent) {
        if (!selected) return console.warn('');
        dispatch('submit', { list_id: selected.value });
        on_close();
    }
</script>

<button on:click={on_open}>
    <SquareRoundedArrowRightSvg />
</button>

<Modal
    class="app-modal move-repos-modal"
    {opened}
    {centered}
    {overlayOpacity}
    withCloseButton={false}
    on:close={on_close}
    overlayTransition="fade"
    overlayTransitionOptions={{ duration: 1000, easing: sineInOut }}
    transitionOptions={{ duration: 1000, easing: sineInOut }}
    transition="fade"
>
    <form on:submit|preventDefault={on_submit_form}>
        <Svelecte
            bind:this={select_component}
            class="svelecte-control control"
            {options}
            valueAsObject
            bind:value={selected}
            placeholder="Select a list"
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
    button {
        padding: 5px;

        :global(svg.icon-square-rounded-arrow-right) {
            width: 22px;
            height: 22px;
            stroke: var(--color-text-secondary);
        }

        &:hover :global(svg.icon-square-rounded-arrow-right) {
            stroke: var(--color-text);
        }
    }

    // :global(.move-repos-modal) {
    //     animation: 250ms linear 0ms 1 normal both running modal-fade;
    // }

    // @media (prefers-reduced-motion) {
    //     :global(.app-modal.move-repos-modal div[role="dialog"]) {
    //         background-color: rgba(255, 0, 0, 80%);
    //     }
    // }

    // @media not (prefers-reduced-motion) {
    //     :global(.app-modal.move-repos-modal div[role="dialog"]) {
    //         background-color: rgba(0, 255, 0, 80%);
    //     }
    // }

    :global(.app-modal.move-repos-modal div[role="dialog"]) {
        padding: 0px;
    }

    :global(div.svelecte-control.control) {
        --sv-bg: var(--color-bg-light);
        --sv-color: var(--color-text);
        --sv-min-height: 48px;
        --sv-border: 1px solid var(--color-border);
        --sv-active-border: 1px solid var(--color-border-hover);
        --sv-placeholder-color: var(--color-text-translucent);
        --sv-dropdown-height: 256px;
        --sv-dropdown-active-bg: var(--color-border);
        --sv-dropdown-selected-bg: var(--color-border);
        --sv-item-color: var(--sv-color);
        --sv-item-active-color: var(--sv-item-color);
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
