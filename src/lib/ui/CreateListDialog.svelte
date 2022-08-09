<script lang="ts">
    import { DialogAction, set_dialog_state } from '$lib/stores/create-dialog-state';
    import { getContext } from 'svelte';

    let input_value: string | undefined;

    const { close } = getContext('simple-modal');

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
        justify-content: space-between;

        // .modal-button-cancel {
        //     --stroke-rgb: var(--color-red-500-rgb);
        // }

        // .modal-button-ok {
        //     --stroke-rgb: var(--color-green-500-rgb);
        // }

        .modal-button-cancel,
        .modal-button-ok {
            // padding: 1px;
            // border-radius: 50%;
            border: 1px solid rgb(var(--stroke-rgb));
            // stroke: rgb(var(--stroke-rgb));
            // &:hover {
            //     background-color: rgb(var(--stroke-rgb) / 0.1);
            // }
        }
    }
</style>
