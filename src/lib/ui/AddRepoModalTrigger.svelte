<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte';
    import PlusSvg from './svgs/PlusSvg.svelte';
    import type { AddRepoEvents } from './events';
    import type { Context as ModalContext } from 'svelte-simple-modal';
    import { get_modal_state, set_modal_state } from '$lib/stores/add-repo-modal-state';
    import AddRepoModal from './AddRepoModal.svelte';

    export let list_id: string;

    const dispatch = createEventDispatcher<AddRepoEvents>();

    const { open } = getContext<ModalContext>('simple-modal');

    const on_modal_close = () => {
        let state = get_modal_state(list_id);
        if (state.action === 'deciding') {
            state.action = 'canceled';
            set_modal_state(list_id, state);
        }
        switch (state.action) {
            case 'canceled':
                dispatch('canceled');
                break;
            case 'submitted':
                dispatch('submit', state.repo_ids);
                break;
        }
    };

    type _ClickEvent = MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };
    const on_click = (_event: _ClickEvent) => {
        set_modal_state(list_id, { action: 'deciding' });
        open(
            AddRepoModal,
            {
                list_id,
            },
            {
                classBg: 'modal-bg',
                classContent: 'modal-content',
                classWindow: 'modal-window',
                classWindowWrap: 'modal-window-wrap',
                closeButton: false,
                closeOnEsc: true,
                closeOnOuterClick: true,
            },
            {
                onClose: on_modal_close,
            }
        );
    };
</script>

<button class="button" on:click={on_click}>
    <PlusSvg />
</button>

<style lang="scss">
    :global(div.bg.modal-bg) {
        background: rgba(0, 0, 0, 0.4);
        justify-content: flex-start;

        :global(div.wrap.modal-window-wrap) {
            top: 24vh;

            :global(div.window.modal-window) {
                background: transparent;

                :global(div.content.modal-content) {
                    padding: 0px;
                    overflow: visible;
                }
            }
        }
    }

    button {
        border: none;
        background-color: transparent;
        padding: 0px;

        :global(svg.icon-plus) {
            width: 18px;
            height: 18px;
        }
    }
</style>
