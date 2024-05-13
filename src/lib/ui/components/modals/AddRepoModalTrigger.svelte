<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte';
    import PlusSvg from '$components/svgs/PlusSvg.svelte';
    import type { AddRepoModalEvents } from '$lib/ui/events';
    import type { Context as ModalContext } from 'svelte-simple-modal';
    import AddRepoModalContent from './AddRepoModalContent.svelte';

    export let list_id: string;

    const dispatch = createEventDispatcher<AddRepoModalEvents>();

    const { open } = getContext<ModalContext>('simple-modal');

    const on_submit = (repo_ids: string[]) => dispatch('submit', { repo_ids });

    const on_click = (_event: MouseEvent) => {
        open(
            AddRepoModalContent,
            {
                list_id,
                on_submit,
            },
            {
                classBg: 'add-repo-modal-bg',
                classContent: 'add-repo-modal-content',
                classWindow: 'add-repo-modal-window',
                classWindowWrap: 'add-repo-modal-window-wrap',
                closeButton: false,
                closeOnEsc: true,
                closeOnOuterClick: true,
            },
        );
    };
</script>

<button on:click={on_click}>
    <PlusSvg />
</button>

<style lang="scss">
    :global(div.bg.add-repo-modal-bg) {
        background: rgba(0, 0, 0, 0.4);
        justify-content: flex-start;

        :global(div.wrap.add-repo-modal-window-wrap) {
            top: 24vh;

            :global(div.window.add-repo-modal-window) {
                background: transparent;

                :global(div.content.add-repo-modal-content) {
                    padding: 0px;
                    overflow: visible;
                }
            }
        }
    }

    button:hover :global(svg.icon-plus) {
        stroke: rgba(var(--color-green-500-rgb) / 0.8);
    }

    button :global(svg.icon-plus) {
        width: 18px;
        height: 18px;
    }
</style>
