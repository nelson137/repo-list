import type { Repo } from "$lib/models/repo";
import * as _ from 'lodash-es';
import { get, writable } from "svelte/store";
import { cloneMapObj } from "./utils";

export class RepositoriesData {
    /**
     * A dictionary of the repositories.
     *
     * Repositories are stored in the lists by ID only. This allows for quick
     * access to a repo by ID.
     */
    public repositories: { [id: string]: Repo };

    constructor(repositories: RepositoriesData['repositories'] = {}) {
        this.repositories = repositories;
    }

    public clone = (): RepositoriesData => {
        const new_data = new RepositoriesData();
        new_data.repositories = cloneMapObj(this.repositories);
        return new_data;
    };

    /**
     * Load data.
     * @param repos The array of repositories.
     */
    public load = (repos: Repo[]) => {
        this.repositories = _.keyBy(repos, r => r.id.toString());
    };

    /**
     * Get a repository by ID.
     * @param id The ID of the repository.
     */
    public get_repo = (id: number | string): Repo => this.repositories[id.toString()];
};

export class RepositoriesStore {
    /**
     * The store for the repositories data.
     */
    private data = writable(new RepositoriesData());

    /**
     * Update the repositories store data, immutably.
     * @param callback The callback that takes a copy of the current store value
     * and updates it.
     */
    private update = (callback: (nextData: RepositoriesData) => void) =>
        this.data.update(old_data => {
            const new_data = old_data.clone();
            callback(new_data);
            return new_data;
        });

    public load = (repos: Repo[]) => this.update(data => data.load(repos));

    /**
     * Get a repository by ID from the store.
     * @param id The ID of the repository.
     */
    public get_repo = (id: number): Readonly<Repo> => get(this.data).get_repo(id);
}

/**
 * The repositories store API.
 */
export const repos = new RepositoriesStore();
