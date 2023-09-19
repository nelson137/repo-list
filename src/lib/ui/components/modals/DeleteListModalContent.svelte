<script lang="ts">
    import { getContext } from 'svelte';
    import CheckButton from '$components/CheckButton.svelte';
    import XButton from '$components/XButton.svelte';
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

<p class="message">Are you sure you want to delete list "{list_name}"?</p>

<div class="modal-buttons">
    <XButton variant="colorbox" on:click={on_no_click} />
    <CheckButton variant="colorbox" on:click={on_yes_click} />
</div>

<style lang="scss">
    .modal-buttons {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
    }
</style>
