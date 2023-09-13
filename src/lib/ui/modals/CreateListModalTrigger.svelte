<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte';
    import CreateListModalContent from './CreateListModalContent.svelte';
    import type { CreateListModalEvents } from '$lib/ui/events';
    import type { Context as ModalContext } from 'svelte-simple-modal';
    import ListPlusSvg from '../svgs/ListPlusSvg.svelte';

    const dispatch = createEventDispatcher<CreateListModalEvents>();

    const { open } = getContext<ModalContext>('simple-modal');

    const on_ok = (name: string) => dispatch('ok', { name });

    const on_click = (_event: MouseEvent) => {
        open(
            CreateListModalContent,
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

<button on:click={on_click}>
    <ListPlusSvg />
</button>

<style lang="scss">
    @use 'global' as *;

    button :global(.icon-list-plus) {
        stroke: var(--color-text-secondary);
        transition: stroke 150ms ease-in-out;

        &:hover {
            stroke: var(--color-text);
        }
    }

    :global(div.modal-wrap div.modal-window) {
        max-width: 512px;
    }
</style>
