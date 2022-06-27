<script lang="ts">
    import type { HandlerOutput } from '.';

    interface $$Props extends HandlerOutput {}

    export let data: HandlerOutput['data'];
</script>

<p>{JSON.stringify(data)}</p>
