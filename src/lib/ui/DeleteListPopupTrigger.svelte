<script lang="ts">
    import { get_popup_state, PopupState, set_popup_state } from '$lib/stores/delete-popup-state';
    import TrashSvg from '$lib/ui/svgs/TrashSvg.svelte';
    import { createEventDispatcher, getContext } from 'svelte';
    import DeleteListPopup from './DeleteListPopup.svelte';
    import type { DeleteListEvents } from './events';
    import type { Context as ModalContext } from 'svelte-simple-modal';

    export let list_id: string;
    export let list_name: string;

    const dispatch = createEventDispatcher<DeleteListEvents>();

    const { open } = getContext<ModalContext>('simple-modal');

    const on_modal_close = () => {
        let state = get_popup_state(list_id);
        if (state === PopupState.Deciding) {
            state = PopupState.Canceled;
            set_popup_state(list_id, PopupState.Canceled);
        }
        switch (state) {
            case PopupState.Canceled:
                dispatch('canceled');
                break;
            case PopupState.No:
                dispatch('no');
                break;
            case PopupState.Yes:
                dispatch('yes');
                break;
        }
    };

    type _ClickEvent = MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };
    const on_click = (_event: _ClickEvent) => {
        set_popup_state(list_id, PopupState.Deciding);
        open(
            DeleteListPopup,
            {
                list_id,
                list_name,
            },
            {
                closeButton: false,
                closeOnEsc: true,
                closeOnOuterClick: true,
                classWindowWrap: 'modal-wrap',
                classWindow: 'modal-window',
            },
            {
                onClose: on_modal_close,
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
        padding: 0px;
        border: none;
        background-color: transparent;

        .click-wrapper {
            :global(svg.icon-trash) {
                width: 18px;
                height: 18px;
            }
        }
    }
</style>
