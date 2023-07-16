<script lang="ts">
    import { page } from '$app/stores';

    const UNKNOWN_ERR_MSG = 'An unknown error occurred.';
</script>

<h1>{$page.status}</h1>

<h2>{$page.error?.message ?? UNKNOWN_ERR_MSG}</h2>
