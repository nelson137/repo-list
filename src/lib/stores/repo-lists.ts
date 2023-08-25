import type { Repo } from "$lib/models/repo";
import { RepoList, RepoListStorage } from "$lib/models/repo-list";
import * as _ from 'lodash-es';
import { derived, get, writable } from "svelte/store";
import { cloneMapObj } from "./utils";
import { repos as repos_store } from "./repos";

export class RepositoryListsData {
    /**
     * An array of list IDs indicating the order in which they should be displayed.
     */
    public list_order: string[] = [];

    /**
     * A dictionary of the repository lists.
     *
     * This allows for quick access to a list by ID.
     */
    public lists: { [id: string]: RepoList } = {};

    public clone = (): RepositoryListsData => {
        const new_data = new RepositoryListsData();
        new_data.lists = cloneMapObj(this.lists);
        new_data.list_order = JSON.parse(JSON.stringify(this.list_order));
        return new_data;
    };

    /**
     * Load data.
     * @param lists The repository lists from storage.
     *
     * - Insert `lists` into the list map.
     * - Calculate the list order.
     */
    public load = (lists: RepoListStorage[]) => {
        this.lists = _.keyBy(lists.map(s => new RepoList(s)), rl => rl.id);

        type IndexedRepoListStorage = RepoListStorage & { index: number };
        this.list_order = lists
            .filter((rls => {
                if (rls.index === null)
                    console.warn('Skipping list from local storage with no index:', rls);
                return rls.index !== null;
            }) as (_: RepoListStorage) => _ is IndexedRepoListStorage)
            .sort((a, b) => a.index - b.index)
            .map(l => l.id);
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
 * Load the repository lists store and the repositories store from local storage
 * using `repos`.
 * @param repos The repositories from the GitHub API.
 */
export function load_local_storage(repos: Repo[]) {
    const list_storages = read_local_storage();
    repo_lists.load(list_storages);
    repos_store.load(repos);
}

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
        Object.values(lists).map(l => [l.id, new RepoListStorage({ ...l, index: null })])
    );

    for (let i = 0; i < list_order.length; i++) {
        const id = list_order[i];
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

export class RepositoryListsStore {
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
     * Load the repository lists data.
     * @param repos The repositories from the GitHub API.
     * @param list_storages The repository lists from local storage.
     */
    public load = (list_storages: RepoListStorage[]) =>
        this.update(data => data.load(list_storages));

    /**
     * Write the repository lists store to local storage.
     */
    public write_to_local_storage = () => write_to_local_storage(get(this.store));

    /**
     * Get a repository list by ID from the store.
     * @param id The ID of the repository list.
     */
    public get_list = (id: string): Readonly<RepoList> => get(this.store).get_list(id);

    /**
     * Get the repository IDs for a list.
     * @param id The ID of the repository list.
     */
    public get_list_repos = (id: string): Readonly<number[]> => this.get_list(id).repo_ids;

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
     * Append repositories to a list.
     * @param list_id The ID of the repository list.
     * @repo_ids The list of repository IDs to append to the list.
     */
    public insert_repos = (list_id: string, repo_ids: number[]) => this.update(data => {
        const list = data.lists[list_id];
        list.repo_ids = list.repo_ids.concat(repo_ids);
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
export const repo_lists = new RepositoryListsStore();

/**
 * The repository lists array store.
 */
export const lists = repo_lists.lists;
