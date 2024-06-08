<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { CreateListModalEvents } from '$lib/events';
    import ListPlusSvg from '../svgs/ListPlusSvg.svelte';
    import { Modal, TextInput } from '@svelteuidev/core';

    const dispatch = createEventDispatcher<CreateListModalEvents>();

    let opened = false;

    // Hack because some props on `Modal` are typed incorrectly.
    let centered = true as unknown as null;
    const overlayOpacity = 0.4 as unknown as null;

    let name = '';

    function on_open() {
        opened = true;
    }

    function on_close() {
        opened = false;
        name = '';
    }

    function on_form_submit() {
        dispatch('ok', { name: name.trim() });
        on_close();
    }
</script>

<button class="trigger" on:click={on_open}>
    <ListPlusSvg />
</button>

<Modal
    class="app-modal create-list-modal"
    {opened}
    {centered}
    withCloseButton={false}
    {overlayOpacity}
    on:close={on_close}
>
    <form on:submit|preventDefault={on_form_submit}>
        <div class="input-wrapper">
            <label for="new-list-name">New list name:&nbsp;&nbsp;</label>
            <TextInput class="name-input" bind:value={name} />
        </div>

        <div class="modal-buttons">
            <button class="modal-button-cancel" type="button" on:click={on_close}>Cancel</button>
            <button class="modal-button-ok" type="submit">Ok</button>
        </div>
    </form>
</Modal>

<style lang="scss">
    @use 'global' as *;

    button.trigger :global(.icon-list-plus) {
        stroke: var(--color-text-secondary);
        transition: stroke 150ms ease-in-out;

        &:hover {
            stroke: var(--color-text);
        }
    }

    :global(.app-modal.create-list-modal div[role="dialog"]) {
        width: 60%;
        min-width: 300px;
        max-width: 512px;
        background: $colorModalBg;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(6px);
    }

    .input-wrapper {
        margin-top: 16px;
        display: flex;
        flex-direction: row;

        label,
        :global(input) {
            font-size: 16px;
        }

        label {
            color: var(--color-text);
            text-wrap: nowrap;
            line-height: 34px;
        }

        :global(.name-input) {
            flex-grow: 1;
        }
    }

    .modal-buttons {
        margin-top: 32px;
        display: flex;
        flex-flow: row wrap;
        justify-content: space-around;

        .modal-button-cancel {
            background-color: red;
        }

        .modal-button-ok {
            background-color: green;
        }

        .modal-button-cancel,
        .modal-button-ok {
            min-width: 64px;
            color: white;
            padding: 6px 8px;
            border-radius: 8px;
            opacity: 90%;
            &:hover {
                opacity: 100%;
            }
        }
    }
</style>
