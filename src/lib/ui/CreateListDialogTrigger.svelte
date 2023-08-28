<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte';
    import CreateListDialog from './CreateListDialog.svelte';
    import type { CreateListModalEvents } from './events';
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

<div class="create-list-wrapper">
    <button on:click={on_click}>New list</button>
</div>

<style lang="scss">
    @import '../../styles/global.scss';

    .create-list-wrapper {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;

        button {
            --color: var(--color-border);
            background-color: transparent;
            border: 2px dashed var(--color);
            border-radius: 18px;
            padding: 20px 0px;
            font-size: 1.5em;
            color: var(--color);
            transition: color 150ms ease-in-out, border-color 150ms ease-in-out;

            // Overridden by media query when cols > 2
            $w: listInnerWidth(1);
            width: $w;
            min-width: $w;
            max-width: 600px; // capped at the 3-column width

            &:hover {
                --color: rgba(var(--color-green-500-rgb) / 0.7);
            }
        }
    }

    @for $cols from 2 through 10 {
        @media screen and (min-width: minSteppedQueryWidth($cols)) {
            .create-list-wrapper > button {
                width: 0.65 * listInnerWidth($cols);
            }
        }
    }

    :global(div.modal-wrap div.modal-window) {
        max-width: 512px;
    }
</style>
