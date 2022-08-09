<script lang="ts">
    import {
        DialogAction,
        get_dialog_state,
        set_dialog_state,
    } from '$lib/stores/create-dialog-state';
    import { createEventDispatcher, getContext } from 'svelte';
    import CreateListDialog from './CreateListDialog.svelte';
    import type { CreateListEvents } from './events';
    import CirclePlusSvg from './svgs/CirclePlusSvg.svelte';

    const dispatch = createEventDispatcher<CreateListEvents>();

    const { open } = getContext('simple-modal');

    type _ClickEvent = MouseEvent & { currentTarget: EventTarget & HTMLDivElement };
    const on_click = (_event: _ClickEvent) => {
        set_dialog_state(DialogAction.Waiting, null);
        open(
            CreateListDialog,
            {},
            {
                closeButton: false,
                closeOnEsc: true,
                closeOnOuterClick: true,
                classWindowWrap: 'modal-wrap',
                classWindow: 'modal-window',
            },
            {
                onClose: (_event: CustomEvent) => {
                    let { action, name } = get_dialog_state();
                    switch (action) {
                        case DialogAction.Ok:
                            if (name === null) {
                                name = '';
                                console.warn(
                                    'State for dialog name is null, defaulting to empty string.'
                                );
                            }
                            dispatch('ok', { name });
                            break;
                        default:
                            dispatch('canceled');
                            break;
                    }
                    set_dialog_state(DialogAction.NotOpen, null);
                },
            }
        );
    };
</script>

<div class="create-list-icon" on:click={on_click}>
    <CirclePlusSvg />
</div>

<style lang="scss">
    :global(div.modal-wrap div.modal-window) {
        max-width: 512px;
    }

    .create-list-icon {
        background-color: var(--color-bg-dark);
        border-radius: 50%;
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
