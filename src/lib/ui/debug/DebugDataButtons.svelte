<script lang="ts">
    import { RepoList } from '$lib/models/repo-list';
    import { in_edit_mode, lists, repo_lists } from '$lib/stores/repo-lists';
    import { get } from 'svelte/store';

    function delete_all_lists() {
        get(repo_lists.lists).forEach(l => repo_lists.delete_list(l.id));
    }

    function on_click_clear() {
        delete_all_lists();
        if (!get(in_edit_mode)) {
            repo_lists.write_to_local_storage();
        }
    }

    function on_click_defaults() {
        delete_all_lists();
        repo_lists.add_list(
            RepoList.from('School', [
                '258009459',
                '530779943',
                '399959884',
                '439224243',
                '481792595',
                '332090987',
                '414866981',
                '558219478',
                '486775307',
                '486736755',
            ])
        );
        repo_lists.add_list(
            RepoList.from('Games', ['529015461', '532099005', '79787322', '486775307', '486736755'])
        );
        repo_lists.add_list(RepoList.from('Pinned', ['102030669', '532099005', '202956385']));
        if (!get(in_edit_mode)) {
            repo_lists.write_to_local_storage();
        }
    }

    function on_click_clear_first_list() {
        const first_id = get(lists)[0].id;
        repo_lists.update_list_repos(first_id, []);
        if (!get(in_edit_mode)) {
            repo_lists.write_to_local_storage();
        }
    }
</script>

<div class="container">
    <button on:click={on_click_clear}>Clear</button>
    <button on:click={on_click_defaults}>Default Lists</button>
    <button on:click={on_click_clear_first_list}>Clear First List</button>
</div>

<style lang="scss">
    .container {
        position: absolute;
        top: calc(62px + 8px);
        left: 8px;
        display: flex;
        flex-direction: row;
        gap: 8px;

        button {
            background-color: transparent;
            --color: gray;
            color: var(--color);
            border: 1px solid var(--color);
            border-radius: 6px;
            padding: revert;

            &:hover {
                --color: lightgray;
            }
        }
    }
</style>
