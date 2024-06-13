<script lang="ts">
    import { Modal } from '@svelteuidev/core';
    import TrashSvg from '$lib/components/svgs/TrashSvg.svelte';
    import { createEventDispatcher } from 'svelte';
    import type { DeleteListModalEvents } from '$lib/events';
    import XButton from '../XButton.svelte';
    import CheckButton from '../CheckButton.svelte';

    export let list_id: string;
    export let list_name: string;

    const dispatch = createEventDispatcher<DeleteListModalEvents>();

    let opened = false;

    // Hack because some props on `Modal` are typed incorrectly.
    const centered = true as unknown as null;
    const overlayOpacity = 0.5 as unknown as null;

    function on_yes() {
        dispatch('yes', { list_id });
        opened = false;
    }
</script>

<button class="trigger" on:click={() => (opened = true)}>
    <TrashSvg />
</button>

<Modal
    class="app-modal delete-list-modal"
    {opened}
    {centered}
    withCloseButton={false}
    {overlayOpacity}
    on:close={() => (opened = false)}
>
    <p class="message">Are you sure you want to delete list "{list_name}"?</p>

    <div class="modal-buttons">
        <XButton variant="colorbox" on:click={() => (opened = false)} />
        <CheckButton variant="colorbox" on:click={on_yes} />
    </div>
</Modal>

<style lang="scss">
    @use 'global' as *;

    :global(.app-modal.delete-list-modal div[role='dialog']) {
        width: unset;
        max-width: 512px;
        background: $colorModalBg;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(6px);
    }

    button.trigger {
        padding: 6px;

        :global(svg.icon-trash) {
            width: 20px;
            height: 20px;
            stroke: var(--color-text-secondary);
        }

        &:hover :global(svg.icon-trash) {
            stroke: rgba(var(--color-red-500-rgb) / 0.8);
        }
    }

    .modal-buttons {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
    }
</style>
