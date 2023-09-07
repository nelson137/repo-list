<script lang="ts">
    import TrashSvg from '$lib/ui/svgs/TrashSvg.svelte';
    import { createEventDispatcher, getContext } from 'svelte';
    import DeleteListModal from './DeleteListModal.svelte';
    import type { DeleteListModalEvents } from '$lib/ui/events';
    import type { Context as ModalContext } from 'svelte-simple-modal';

    export let list_id: string;
    export let list_name: string;

    const dispatch = createEventDispatcher<DeleteListModalEvents>();

    const { open } = getContext<ModalContext>('simple-modal');

    const on_yes = () => dispatch('yes', { list_id });

    type _ClickEvent = MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };
    const on_click = (_event: _ClickEvent) => {
        open(
            DeleteListModal,
            {
                list_name,
                on_yes,
            },
            {
                closeButton: false,
                closeOnEsc: true,
                closeOnOuterClick: true,
                classWindowWrap: 'modal-wrap',
                classWindow: 'modal-window',
            }
        );
    };
</script>

<button class="wrapper" on:click={on_click}>
    <div class="click-wrapper">
        <TrashSvg />
    </div>
</button>

<style lang="scss">
    :global(div.modal-wrap div.modal-window) {
        max-width: 512px;
    }

    .wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .click-wrapper {
            :global(svg.icon-trash) {
                width: 18px;
                height: 18px;
            }
        }
    }
</style>
