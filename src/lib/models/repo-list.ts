import { Expose } from 'class-transformer';
import * as _ from 'lodash-es';
import { v4 as uuid } from 'uuid';
import type { Repo } from './repo';
import { from_json } from './_model';

export class RepoList {
    /** The UUID of this list. */
    @Expose() id: string;
    /** The name of this list. */
    @Expose() name: string;
    /** The IDs of the [Repos](./repo.ts) in this list. */
    @Expose() repo_ids: number[];

    constructor(name: string, repo_ids: number[] = [], id?: string) {
        this.name = name;
        this.repo_ids = repo_ids;
        this.id = id ? id : uuid();
    }

    /**
     * Deserialize an instance of this model.
     * @param data The raw JSON object data.
     * @returns An instance of this model from `data`.
     */
    public static from_json = (data: Record<string, any>): RepoList => from_json(RepoList, data);

    /**
     * Deserialize an array of instances of this model.
     * @param data The raw JSON object data.
     * @returns An array of instances of this model from `data`.
     */
    public static from_json_array = (data: Record<string, any>[]): RepoList[] =>
        from_json(RepoList, data);
}

export class RepoListStorage extends RepoList {
    public index: number | null;
}

const REPO_LISTS_KEY = 'repo-lists';

export const ALL_REPOS_LIST_ID = '80ff2230-8456-451c-b2ac-eba72e26bcb9';

const type = (x: any, type: string) => typeof x === type;

const repo_list_data_is_valid = (repo_list_data: any): boolean => {
    if (typeof repo_list_data !== 'object') {
        console.error('Data for repository list is not an object:', repo_list_data);
        return false;
    }
    const list = repo_list_data;
    if (
        type(list.id, 'string') &&
        type(list.index, 'number') &&
        type(list.name, 'string') &&
        Array.isArray(list.repo_ids)
    ) {
        return true;
    }
    console.error('Invalid data for repository list:', repo_list_data);
    return false;
};

export class RepositoryLists {
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
    private list_order: string[] = [];

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

    public get_repo = (id: number | string): Repo => this.repositories[id.toString()];

    public add_list = (list: RepoList) => {
        this.lists[list.id] = list;
        this.list_order.unshift(list.id);
        this.to_local_storage();
    };

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

    public static from_local_storage = (repos: Repo[]): RepositoryLists => {
        const repo_lists = new RepositoryLists();
        repo_lists.entries = _.keyBy(repos, r => r.id.toString());

        try {
            const repo_lists_data_raw = JSON.parse(localStorage.getItem(REPO_LISTS_KEY) ?? '[]');
            if (!Array.isArray(repo_lists_data_raw)) {
                console.error('data is not an array:', repo_lists_data_raw);
                return repo_lists;
            }

            const valid_repo_lists_data = repo_lists_data_raw.filter(repo_list_data_is_valid);

            const repo_lists_data: RepoList[] = valid_repo_lists_data.map(RepoList.from_json);

            repo_lists.lists = _.keyBy(repo_lists_data, rl => rl.id);
            repo_lists.lists[ALL_REPOS_LIST_ID] = new RepoList(
                'All',
                repos.map(r => r.id),
                ALL_REPOS_LIST_ID
            );

            const order = [];
            for (const l of valid_repo_lists_data) order[l.index] = l.id;
            repo_lists.list_order = order.filter(id => id !== undefined).concat([ALL_REPOS_LIST_ID]);
        } catch (error: any) {
            console.error('Failed to load repository lists from local storage:', error);
        }

        return repo_lists;
    };

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
}
