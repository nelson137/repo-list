<script lang="ts">
    import TrashSvg from '$components/svgs/TrashSvg.svelte';
    import { createEventDispatcher, getContext } from 'svelte';
    import DeleteListModalContent from './DeleteListModalContent.svelte';
    import type { DeleteListModalEvents } from '$lib/ui/events';
    import type { Context as ModalContext } from 'svelte-simple-modal';

    export let list_id: string;
    export let list_name: string;

    const dispatch = createEventDispatcher<DeleteListModalEvents>();

    const { open } = getContext<ModalContext>('simple-modal');

    const on_yes = () => dispatch('yes', { list_id });

    const on_click = (_event: MouseEvent) => {
        open(
            DeleteListModalContent,
            {
                list_name,
                on_yes,
            },
            {
                classBg: 'delete-list-modal-bg',
                closeButton: false,
                closeOnEsc: true,
                closeOnOuterClick: true,
                classWindow: 'delete-list-modal-window',
            }
        );
    };
</script>

<button on:click={on_click}>
    <TrashSvg />
</button>

<style lang="scss">
    @use 'global' as *;

    :global(div.bg.delete-list-modal-bg) {
        background-color: rgba(0, 0, 0, 0.5);

        :global(div.delete-list-modal-window) {
            max-width: 512px;
            background: $colorModalBg;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(6px);
        }
    }

    button:hover :global(svg.icon-trash) {
        stroke: rgba(var(--color-red-500-rgb) / 0.8);
    }

    button :global(svg.icon-trash) {
        width: 18px;
        height: 18px;
    }
</style>
