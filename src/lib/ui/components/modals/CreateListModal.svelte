<script lang="ts">
    import { Modal } from 'svelte-simple-modal';
    import CreateListModalTrigger from './CreateListModalTrigger.svelte';
</script>

<Modal>
    <CreateListModalTrigger on:ok />
</Modal>
