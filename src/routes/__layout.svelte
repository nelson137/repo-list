<script lang="ts" context="module">
    import { User } from '$lib/models/user';
    import type { LoadEvent } from '@sveltejs/kit';
    import type { Load } from './__types/__layout';

    import '../app.css';

    let user: User;

    export const load: Load<{}, {}> = async ({ fetch }: LoadEvent) => {
        const response = await fetch('/api/user');
        user = User.from_json(await response.json());
        return {
            status: response.status,
        };
    };
</script>

<header>
    <span>GitHub Face</span>
    <div class="flex-spacer" />
    <a href={user?.html_url}>
        <img src={user?.avatar_url} alt="@{user?.login}" />
    </a>
</header>

<main>
    <slot />
</main>

<style lang="scss">
    header {
        background-color: var(--color-bg-medium);
        box-shadow: inset 0 -1px 0 var(--color-border-muted);
        color: var(--color-text);
        box-sizing: border-box;
        height: 62px;
        // padding: 16px 32px;
        padding: 0 32px;
        display: flex;
        align-items: center;

        .flex-spacer {
            height: 0;
            flex-grow: 1;
        }

        a {
            img {
                border-radius: 50%;
                aspect-ratio: 1;
                width: 24px;
            }
        }
    }

    main {
        margin: 0;
        padding: 3em;
        box-sizing: border-box;
    }
</style>
