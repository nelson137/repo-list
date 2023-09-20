<script lang="ts" context="module">
    export interface Props {
        /**
         * The icon button variant.
         *
         * Variants:
         * - `icon`: Just the icon with neither background nor border. The icon
         *   stroke becomes lighter on hover.
         * - `colorbox`: Similar to `icon`, but has a rounded square with
         *   background color on hover.
         */
        variant?: 'icon' | 'colorbox';

        size?: number;

        // Pass-through button element attributes
        /** The type attribute for the HTML button element. */
        type?: HTMLButtonElement['type'];

        // Pass-through click event modifiers
        /** Whether to `.stopPropagation()` on the click event. */
        stopPropagation?: boolean;
        /** Whether to `.preventDefault()` on the click event. */
        preventDefault?: boolean;
    }

    export const defaults: Props = {
        variant: 'icon',
        size: undefined,
        type: undefined,
        stopPropagation: false,
        preventDefault: false,
    };
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    interface $$Props extends Props {}

    const D = defaults;
    export let variant: $$Props['variant'] = D.variant;
    export let size: $$Props['size'] = D.size;
    export let type: $$Props['type'] = D.type;
    export let stopPropagation: $$Props['stopPropagation'] = D.stopPropagation;
    export let preventDefault: $$Props['preventDefault'] = D.preventDefault;

    const dispatch = createEventDispatcher<{ click: MouseEvent }>();

    function on_click(event: MouseEvent) {
        if (stopPropagation) event.stopPropagation();
        if (preventDefault) event.preventDefault();
        dispatch('click', event);
    }
</script>

<button data-variant={variant} {type} on:click={on_click} style={size ? `--size: ${size}px` : ''}
    ><slot /></button
>

<style lang="scss">
    button[data-variant='icon'] {
        :global(svg) {
            width: var(--size, 24px);
            height: var(--size, 24px);
            stroke: var(--color-text-secondary);
            stroke-width: 2px;
        }

        &:hover :global(svg) {
            stroke: var(--color-text);
        }
    }

    :global(button[data-variant='colorbox']) {
        padding: 3px;
        border-radius: 8px;
        transition: background-color 150ms ease 0ms;

        :global(svg) {
            width: var(--size, 18px);
            height: var(--size, 18px);
            stroke: var(--color-text-secondary);
            stroke-width: 3px;
            transition: stroke 150ms ease 0ms;
        }

        &:hover {
            background-color: var(--color-border-muted);
            :global(svg) {
                stroke: var(--color-text);
            }
        }
    }
</style>
