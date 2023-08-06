import type { Repo } from "$lib/models/repo";
import { RepoList, RepoListStorage } from "$lib/models/repo-list";
import * as _ from 'lodash-es';
import { derived, get, writable } from "svelte/store";

export const REPO_LISTS_KEY = 'repo-lists';

export const ALL_REPOS_LIST_ID = '80ff2230-8456-451c-b2ac-eba72e26bcb9';

class RepositoryListsData {
    /**
     * A dictionary of the repository lists.
     *
     * This allows for quick access to a list by ID.
     */
    public lists: { [id: string]: RepoList } = {};

    /**
     * A dictionary of the repositories.
     *
     * Repositories are stored in the lists by ID only. This allows for quick
     * access to a repo by ID.
     */
    public repositories: { [id: string]: Repo } = {};

    /**
     * An array of list IDs indicating the order in which they should be displayed.
     */
    public list_order: string[] = [];

    /**
     * Load `lists`.
     * @param lists The repository lists from storage.
     *
     * - Insert `lists` into the list map.
     * - Calculate the list order.
     * - Append the special All Repos list to the lists map and order array.
     */
    public load_lists = (lists: RepoListStorage[]) => {
        this.lists = _.keyBy(lists.map(s => new RepoList(s)), rl => rl.id);
        this.lists[ALL_REPOS_LIST_ID] = RepoList.from(
            'All',
            Object.values(this.repositories).map(r => r.id),
            ALL_REPOS_LIST_ID
        );

        this.list_order = lists
            .filter(l => {
                if (l.index === null)
                    console.warn('Skipping list from local storage with no index:', l);
                return l.index !== null;
            })
            .sort(l => l.index ?? Infinity)
            .map(l => l.id)
            .concat([ALL_REPOS_LIST_ID]);
    };

    /**
     * Get the repository lists as an array.
     * @returns The repository lists.
     */
    public get_repo_lists = (): RepoList[] =>
        this.list_order
            .filter(id => {
                if (this.lists[id] === undefined) {
                    console.error('Failed to find list for ID in `order` array:', id);
                    return false;
                }
                return true;
            })
            .map(id => this.lists[id]);

    /**
     * Get a repository by ID.
     * @param id The ID of the repository.
     */
    public get_repo = (id: number | string): Repo => this.repositories[id.toString()];

    /**
     * Get a repository list by ID.
     * @param id The ID of the repository list.
     */
    public get_list = (id: string): RepoList => this.lists[id];

    /**
     * Insert a repository list.
     * @param list The repository list.
     *
     * Note: local storage is updated.
     */
    public add_list = (list: RepoList) => {
        this.lists[list.id] = list;
        this.list_order.unshift(list.id);
        this.to_local_storage();
    };

    /**
     * Delete a repository list.
     * @param id The ID of the repository list.
     *
     * Note: local storage is updated.
     */
    public delete_list = (id: string) => {
        const index = this.list_order.indexOf(id);
        if (index === -1) {
            console.error('Failed to remove list from order with ID:', id);
        } else {
            this.list_order.splice(index, 1);
        }

        if (this.lists[id] === undefined) {
            console.error('Failed to remove list object with ID:', id);
        } else {
            delete this.lists[id];
        }

        this.to_local_storage();
    };

    /**
     * Write the repository lists data to local storage.
     */
    public to_local_storage = () => {
        const data = Object.fromEntries<RepoListStorage>(
            Object.values(this.lists)
                .filter(l => l.id !== ALL_REPOS_LIST_ID)
                .map(l => [l.id, { ...l, index: null }])
        );
        for (let i = 0; i < this.list_order.length; i++) {
            const id = this.list_order[i];
            if (id === ALL_REPOS_LIST_ID) continue;
            if (data[id] === undefined) {
                console.error(
                    'Failed to commit lists to local storage, list not found for id:',
                    id
                );
                continue;
            }
            data[id].index = i;
        }
        localStorage.setItem(REPO_LISTS_KEY, JSON.stringify(Object.values(data)));
    };
};

export class RepositoryLists {
    /**
     * The store for the repository lists data.
     */
    private store = writable(new RepositoryListsData());

    /**
     * The store for repository lists as an array.
     */
    public lists = derived(this.store, rl => rl.get_repo_lists());

    /**
     * Update the repository lists store data, immutably.
     * @param callback The callback that takes a copy of the current store value
     * and updates it.
     */
    private update = (callback: (nextData: RepositoryListsData) => void) =>
        this.store.update(rld => {
            const newRld = new RepositoryListsData();
            Object.assign(newRld, JSON.parse(JSON.stringify(rld)));
            callback(newRld);
            return newRld;
        });

    /**
     * Load the repository lists store from local storage using `repos`.
     * @param repos The repositories from the GitHub API.
     */
    public load_local_storage = (repos: Repo[]) => this.update(data => {
        data.repositories = _.keyBy(repos, r => r.id.toString());

        try {
            const local_storage_data = localStorage.getItem(REPO_LISTS_KEY);
            const repo_lists_data_raw = JSON.parse(local_storage_data ?? '[]');
            if (!Array.isArray(repo_lists_data_raw)) {
                console.error('data is not an array:', repo_lists_data_raw);
                return data;
            }

            data.load_lists(repo_lists_data_raw.map(RepoListStorage.parse));
        } catch (error: any) {
            console.error('Failed to load repository lists from local storage:', error);
        }
    });

    /**
     * Save the repository lists store to local storage.
     */
    public save_to_local_storage = () => get(this.store).to_local_storage();

    /**
     * Get a repository by ID from the store.
     * @param id The ID of the repository.
     */
    public get_repo = (id: number): Readonly<Repo> => get(this.store).get_repo(id);

    /**
     * Get a repository list by ID from the store.
     * @param id The ID of the repository list.
     */
    public get_list = (id: string): Readonly<RepoList> => get(this.store).get_list(id);

    /**
     * Insert a repository list into the store.
     * @param list The repository list.
     */
    public add_list = (list: RepoList) => this.update(data => data.add_list(list));

    /**
     * Delete a repository list by ID from the store.
     * @param list The ID of the repository list.
     */
    public delete_list = (id: string) => this.update(data => data.delete_list(id));

    /**
     * Update the array of repositories for a list by ID in the store.
     * @param list_id The ID of the repository list.
     * @param repo_ids The new array of repository IDs for the list.
     */
    public update_list_repos = (list_id: string, repo_ids: number[]) => this.update(data => {
        data.lists[list_id].repo_ids = repo_ids;
    });
}

/**
 * The repository lists store API.
 */
export const repo_lists = new RepositoryLists();

/**
 * The repository lists array store.
 */
export const lists = repo_lists.lists;
