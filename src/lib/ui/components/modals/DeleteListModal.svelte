<script lang="ts">
    import Modal from 'svelte-simple-modal';
    import DeleteListModalTrigger from './DeleteListModalTrigger.svelte';

    export let list_id: string;
    export let list_name: string;
</script>

<Modal>
    <DeleteListModalTrigger {list_id} {list_name} on:yes />
</Modal>
