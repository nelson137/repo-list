<script lang="ts">
    import { RepoListStorage } from '$lib/models/repo-list';
    import {
        RepositoryListsData,
        load_local_storage,
        write_to_local_storage,
    } from '$lib/stores/repo-lists';
    import { repos } from '$lib/stores/repos';

    function load_store() {
        load_local_storage(repos.get_all());
    }

    function on_click_clear() {
        write_to_local_storage(new RepositoryListsData());
        load_store();
    }

    function on_click_defaults() {
        const rld = new RepositoryListsData();
        rld.load([
            new RepoListStorage({
                index: 0,
                name: 'Pinned',
                id: 'e4c45726-212e-44ce-bfaf-adf6d371ca4d',
                repo_ids: [102030669, 532099005, 202956385],
            }),
            new RepoListStorage({
                index: 1,
                name: 'Games',
                id: '5289b461-a49b-481a-b64f-1206fb73217b',
                repo_ids: [529015461, 532099005, 79787322, 486775307, 486736755],
            }),
            new RepoListStorage({
                index: 2,
                name: 'School',
                id: 'a67dc1b2-ae36-4c5c-a071-60d1b0f90701',
                repo_ids: [
                    258009459, 530779943, 399959884, 439224243, 481792595, 332090987, 414866981,
                    558219478, 486775307, 486736755,
                ],
            }),
        ]);
        write_to_local_storage(rld);
        load_store();
    }
</script>

<div class="container">
    <button on:click={on_click_clear}>Clear</button>
    <button on:click={on_click_defaults}>Default Lists</button>
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

            &:hover {
                --color: lightgray;
            }
        }
    }
</style>
