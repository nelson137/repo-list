<script lang="ts">
    import { getContext } from 'svelte';
    import CheckSvg from '$components/svgs/CheckSvg.svelte';
    import XSvg from '$components/svgs/XSvg.svelte';
    import type { Context as ModalContext } from 'svelte-simple-modal';

    export let list_name: string;
    export let on_yes: () => void;

    const { close } = getContext<ModalContext>('simple-modal');

    const on_no_click = () => close();

    const on_yes_click = () => {
        on_yes();
        close();
    };
</script>

<div class="message-wrapper">
    <p class="message">Are you sure you want to delete list "{list_name}"?</p>
</div>

<div class="modal-buttons">
    <button class="modal-button-no" on:click={on_no_click}>
        <XSvg />
    </button>
    <button class="modal-button-yes" on:click={on_yes_click}>
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
            &:hover {
                background-color: rgb(var(--stroke-rgb) / 0.1);
            }
            :global(svg.icon) {
                stroke: rgb(var(--stroke-rgb));
            }
        }
    }
</style>
