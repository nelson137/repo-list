<script lang="ts">
    import { PopupState, set_popup_state } from '$lib/stores/delete-popup-state';
    import { getContext } from 'svelte';
    import CheckSvg from './svgs/CheckSvg.svelte';
    import XSvg from './svgs/XSvg.svelte';
    import type { Context as ModalContext } from 'svelte-simple-modal';

    export let list_id: string;
    export let list_name: string;

    const { close } = getContext<ModalContext>('simple-modal');

    const on_no = () => {
        set_popup_state(list_id, PopupState.No);
        close();
    };

    const on_yes = () => {
        set_popup_state(list_id, PopupState.Yes);
        close();
    };
</script>

<div class="message-wrapper">
    <p class="message">Are you sure you want to delete list "{list_name}"?</p>
</div>

<div class="modal-buttons">
    <button class="modal-button-no" on:click={on_no}>
        <XSvg />
    </button>
    <button class="modal-button-yes" on:click={on_yes}>
        <CheckSvg />
    </button>
</div>

<style lang="scss">
    :global(.message-wrapper *) {
        color: black;
    }

    .modal-buttons {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;

        .modal-button-no {
            --stroke-rgb: var(--color-red-500-rgb);
        }

        .modal-button-yes {
            --stroke-rgb: var(--color-green-500-rgb);
        }

        .modal-button-no,
        .modal-button-yes {
            padding: 1px;
            border-radius: 50%;
            border: 1px solid rgb(var(--stroke-rgb));
            stroke: rgb(var(--stroke-rgb));
            background-color: transparent;
            &:hover {
                background-color: rgb(var(--stroke-rgb) / 0.1);
            }
            :global(svg) {
                stroke: rgb(var(--stroke-rgb));
            }
        }
    }
</style>
