<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import type { Context as ModalContext } from 'svelte-simple-modal';

    export let on_ok: (name: string) => void;

    let input_value: string | undefined;

    let first_input: HTMLElement;

    const { close } = getContext<ModalContext>('simple-modal');

    onMount(() => {
        first_input.focus();
    });

    const on_cancel = () => close();

    const on_form_submit = () => {
        on_ok(input_value?.trim() ?? '');
        close();
    };
</script>

<form on:submit|preventDefault={on_form_submit}>
    <div class="input-wrapper">
        <label for="new-list-name">New list name:&nbsp;&nbsp;</label>
        <input id="new-list-name" bind:this={first_input} bind:value={input_value} />
    </div>

    <div class="modal-buttons">
        <button class="modal-button-cancel" type="button" on:click={on_cancel}>Cancel</button>
        <button class="modal-button-ok" type="submit">Ok</button>
    </div>
</form>

<style lang="scss">
    .input-wrapper {
        margin-top: 16px;
        display: flex;
        flex-direction: row;

        label,
        input {
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
            opacity: 90%;
            &:hover {
                opacity: 100%;
            }
        }
    }
</style>
