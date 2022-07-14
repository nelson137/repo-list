<script lang="ts">
    const login = async () => {
        const _ = await fetch('/login', { mode: 'no-cors' });
    };
</script>

<a href="/login" target="_blank">Sign In</a>
