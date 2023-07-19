<script lang="ts">
    import { DialogAction, set_dialog_state } from '$lib/stores/create-dialog-state';
    import { getContext } from 'svelte';
    import type { Context as ModalContext } from 'svelte-simple-modal';

    let input_value: string | undefined;

    const { close } = getContext<ModalContext>('simple-modal');

    const on_cancel = () => {
        set_dialog_state(DialogAction.Canceled);
        close();
    };

    const on_ok = () => {
        console.log('dialog | input value:', input_value);
        set_dialog_state(DialogAction.Ok, (input_value ?? '').trim());
        close();
    };
</script>

<div class="input-wrapper">
    <span class="label">New list name:&nbsp;&nbsp;</span>
    <input bind:value={input_value} />
</div>

<!-- TODO: style dialog box -->
<div class="modal-buttons">
    <button class="modal-button-cancel" on:click={on_cancel}>Cancel</button>
    <button class="modal-button-ok" on:click={on_ok}>Ok</button>
</div>

<style lang="scss">
    .input-wrapper {
        margin-top: 16px;
        display: flex;
        flex-direction: row;

        .label {
            color: black;
        }

        input {
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
            border-width: 0;
            opacity: 90%;
            &:hover {
                opacity: 100%;
            }
        }
    }
</style>
