import type { Repo } from "$lib/models/repo";
import { REPO_LISTS_KEY, RepoList, RepoListStorage, RepositoryLists } from "$lib/models/repo-list";
import * as _ from 'lodash-es';
import { derived, get, writable } from "svelte/store";

const store = writable<RepositoryLists>(new RepositoryLists());

export const lists = derived(store, rl => rl.get_repo_lists());

export const repo_lists = {
    load_local_storage: (repos: Repo[]) => store.update(repo_lists => {
        repo_lists.load_repositories(repos);

        try {
            const local_storage_data = localStorage.getItem(REPO_LISTS_KEY);
            const repo_lists_data_raw = JSON.parse(local_storage_data ?? '[]');
            if (!Array.isArray(repo_lists_data_raw)) {
                console.error('data is not an array:', repo_lists_data_raw);
                return repo_lists;
            }

            repo_lists.load_lists(repo_lists_data_raw.map(RepoListStorage.parse));
        } catch (error: any) {
            console.error('Failed to load repository lists from local storage:', error);
        }

        return repo_lists;
    }),

    save_to_local_storage: () => get(store).to_local_storage(),

    get_repo: (id: number): Readonly<Repo> => get(store).get_repo(id),

    get_list: (id: string): Readonly<RepoList> => get(store).lists[id],

    add_list: (list: RepoList) => store.update(repo_lists => {
        repo_lists.add_list(list);
        return repo_lists;
    }),

    delete_list: (id: string) => store.update(repo_lists => {
        repo_lists.delete_list(id);
        return repo_lists;
    }),

    update_list_repos: (list_id: string, repo_ids: number[]) => store.update(repo_lists => {
        repo_lists.lists[list_id].repo_ids = repo_ids;
        return repo_lists;
    }),
};
