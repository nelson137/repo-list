<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte';
    import CreateListDialog from './CreateListDialog.svelte';
    import type { CreateListModalEvents } from '$lib/ui/events';
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
    @import '../styles/global.scss';

    @function dashedBackgroundImage($color) {
        @return url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='18' ry='18' stroke='#{$color}' stroke-width='4' stroke-dasharray='6 13' stroke-dashoffset='0' stroke-linecap='square' /%3e%3c/svg%3e");
    }

    .create-list-wrapper {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;

        button {
            height: 72px;
            border-radius: 18px;
            font-size: 1.5em;
            color: $colorBorder;
            background-image: dashedBackgroundImage($colorBorder);
            transition: color 150ms ease-in-out, background-image 150ms ease-in-out;

            // Overridden by media query when cols > 2
            $w: listInnerWidth(1);
            width: $w;
            min-width: $w;
            max-width: 600px; // capped at the 3-column width

            &:hover {
                color: $colorBorderHover;
                background-image: dashedBackgroundImage($colorBorderHover);
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
