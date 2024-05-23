<script lang="ts">
    import IconButton, { type Props as IconButtonProps } from './IconButton.svelte';
    import CheckSvg from './svgs/CheckSvg.svelte';

    type $$Props = IconButtonProps;
</script>

<div>
    <IconButton {...$$restProps} on:click><CheckSvg /></IconButton>
</div>

<style lang="scss">
    div {
        :global(button[data-variant='icon']:hover svg.icon) {
            stroke: rgba(var(--color-green-500-rgb) / 0.8);
        }

        :global(button[data-variant='colorbox']:hover) {
            background-color: rgba(var(--color-green-500-rgb) / 0.5);
        }
    }
</style>
