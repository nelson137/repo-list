<script lang="ts">
    import Modal from 'svelte-simple-modal';
    import AddRepoModalTrigger from './AddRepoModalTrigger.svelte';

    export let list_id: string;
</script>

<Modal>
    <AddRepoModalTrigger {list_id} on:submit />
</Modal>
