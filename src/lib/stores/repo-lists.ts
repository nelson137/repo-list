import type { Repo } from "$lib/models/repo";
import { RepoList, RepoListStorage } from "$lib/models/repo-list";
import * as _ from 'lodash-es';
import { derived, get, writable } from "svelte/store";

export const ALL_REPOS_LIST_ID = '80ff2230-8456-451c-b2ac-eba72e26bcb9';

function cloneMapObj<T extends { clone: () => T }>(
    map: { [key: string]: T }
): { [key: string]: T } {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [`${k}`, v.clone()]));
}

export class RepositoryListsData {
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

    public clone = (): RepositoryListsData => {
        const new_data = new RepositoryListsData();
        new_data.repositories = cloneMapObj(this.repositories);
        new_data.lists = cloneMapObj(this.lists);
        new_data.list_order = JSON.parse(JSON.stringify(this.list_order));
        return new_data;
    };

    /**
     * Load data.
     * @param repos The array of repositories.
     * @param lists The repository lists from storage.
     *
     * - Insert `lists` into the list map.
     * - Calculate the list order.
     * - Append the special All Repos list to the lists map and order array.
     */
    public load = (repos: Repo[], lists: RepoListStorage[]) => {
        this.repositories = _.keyBy(repos, r => r.id.toString());

        this.lists = _.keyBy(lists.map(s => new RepoList(s)), rl => rl.id);
        this.lists[ALL_REPOS_LIST_ID] = RepoList.from(
            'All',
            Object.values(this.repositories).map(r => r.id),
            ALL_REPOS_LIST_ID
        );

        type IndexedRepoListStorage = RepoListStorage & { index: number };
        this.list_order = lists
            .filter((rls => {
                if (rls.index === null)
                    console.warn('Skipping list from local storage with no index:', rls);
                return rls.index !== null;
            }) as (_: RepoListStorage) => _ is IndexedRepoListStorage)
            .sort((a, b) => a.index - b.index)
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
     * Prepend a repository list.
     * @param list The repository list.
     */
    public add_list = (list: RepoList) => {
        this.lists[list.id] = list;
        this.list_order.unshift(list.id);
    };

    /**
     * Delete a repository list.
     * @param id The ID of the repository list.
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
    };
};

export const REPO_LISTS_KEY = 'repo-lists';

/**
 * Load repository lists store data from local storage.
 */
export function read_local_storage(): RepoListStorage[] {
    try {
        const data = JSON.parse(localStorage.getItem(REPO_LISTS_KEY) ?? '[]');
        if (!Array.isArray(data)) {
            throw `data is not an array: ${data}`;
        }

        return data.map(RepoListStorage.parse);
    } catch (error: any) {
        console.error('Failed to load repository lists from local storage:', error);
        return [];
    }
};

/**
 * Write repository lists store data to local storage.
 */
function write_to_local_storage({ lists, list_order }: RepositoryListsData) {
    const data = Object.fromEntries(
        Object.values(lists)
            .filter(l => l.id !== ALL_REPOS_LIST_ID)
            .map(l => [l.id, new RepoListStorage({ ...l, index: null })])
    );

    for (let i = 0; i < list_order.length; i++) {
        const id = list_order[i];
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
        this.store.update(old_data => {
            const new_data = old_data.clone();
            callback(new_data);
            return new_data;
        });

    /**
     * Load the repository lists store from local storage using `repos`.
     * @param repos The repositories from the GitHub API.
     */
    public load_local_storage = (repos: Repo[]) => {
        this.update(data => data.load(repos, read_local_storage()));
    };

    /**
     * Write the repository lists store to local storage.
     */
    public write_to_local_storage = () => write_to_local_storage(get(this.store));

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
     * Prepend a repository list to the store and update local storage.
     * @param list The repository list.
     */
    public add_list = (list: RepoList) => this.update(data => {
        data.add_list(list);
        write_to_local_storage(data);
    });

    /**
     * Delete a repository list by ID from the store and update local storage.
     * @param list The ID of the repository list.
     */
    public delete_list = (id: string) => this.update(data => {
        data.delete_list(id);
        write_to_local_storage(data);
    });

    /**
     * Update the array of repositories for a list by ID in the store and update
     * local storage.
     * @param list_id The ID of the repository list.
     * @param repo_ids The new array of repository IDs for the list.
     */
    public update_list_repos = (list_id: string, repo_ids: number[]) => this.update(data => {
        data.lists[list_id].repo_ids = repo_ids;
        write_to_local_storage(data);
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
