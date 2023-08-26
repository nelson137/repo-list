<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte';
    import PlusSvg from './svgs/PlusSvg.svelte';
    import type { AddRepoModalEvents } from './events';
    import type { Context as ModalContext } from 'svelte-simple-modal';
    import AddRepoModal from './AddRepoModal.svelte';

    export let list_id: string;

    const dispatch = createEventDispatcher<AddRepoModalEvents>();

    const { open } = getContext<ModalContext>('simple-modal');

    const on_submit = (repo_ids: number[]) => dispatch('submit', { repo_ids });

    type _ClickEvent = MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };
    const on_click = (_event: _ClickEvent) => {
        open(
            AddRepoModal,
            {
                list_id,
                on_submit,
            },
            {
                classBg: 'modal-bg',
                classContent: 'modal-content',
                classWindow: 'modal-window',
                classWindowWrap: 'modal-window-wrap',
                closeButton: false,
                closeOnEsc: true,
                closeOnOuterClick: true,
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
