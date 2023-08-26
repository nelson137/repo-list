<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte';
    import CreateListDialog from './CreateListDialog.svelte';
    import type { CreateListModalEvents } from './events';
    import CirclePlusSvg from './svgs/CirclePlusSvg.svelte';
    import type { Context as ModalContext } from 'svelte-simple-modal';

    const dispatch = createEventDispatcher<CreateListModalEvents>();

    const { open } = getContext<ModalContext>('simple-modal');

    const on_ok = (name: string) => dispatch('ok', { name });

    type _ClickEvent = MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };
    const on_click = (_event: _ClickEvent) => {
        open(
            CreateListDialog,
            {
                on_ok,
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

<button class="create-list-icon" on:click={on_click}>
    <CirclePlusSvg />
</button>

<style lang="scss">
    :global(div.modal-wrap div.modal-window) {
        max-width: 512px;
    }

    .create-list-icon {
        background-color: var(--color-bg-dark);
        border: none;
        padding: 2px;

        &:hover :global(svg.icon-circle-plus) {
            stroke: rgb(var(--color-green-500-rgb) / 0.85);
        }

        :global(svg.icon-circle-plus) {
            width: 42px;
            height: 42px;
            stroke: var(--color-border-opaque);
        }
    }
</style>
