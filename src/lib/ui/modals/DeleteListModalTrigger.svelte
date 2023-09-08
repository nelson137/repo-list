<script lang="ts">
    import TrashSvg from '$lib/ui/svgs/TrashSvg.svelte';
    import { createEventDispatcher, getContext } from 'svelte';
    import DeleteListModalContent from './DeleteListModalContent.svelte';
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
            DeleteListModalContent,
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

<button on:click={on_click}>
    <TrashSvg />
</button>

<style lang="scss">
    :global(div.modal-wrap div.modal-window) {
        max-width: 512px;
    }

    button {
        display: flex;
        flex-direction: column;
        justify-content: center;

        :global(svg.icon-trash) {
            width: 18px;
            height: 18px;
        }
    }
</style>
