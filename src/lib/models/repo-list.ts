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

const REPO_LISTS_KEY = 'repo-lists';

export const ALL_REPOS_LIST_ID = '80ff2230-8456-451c-b2ac-eba72e26bcb9';

const repo_list_data_is_valid = (repo_list_data: any): boolean => {
    if (typeof repo_list_data !== 'object') {
        console.error('Data for repository list is not an object:', repo_list_data);
        return false;
    }
    const list = repo_list_data as RepoList;
    if (!list.id || !list.name || !Array.isArray(list.repo_ids)) {
        console.error('Invalid data for repository list:', repo_list_data);
        return false;
    }
    return true;
};

export class RepositoryLists {
    public lists: { [id: string]: RepoList } = {};
    public entries: { [id: string]: Repo } = {};

    public get_repo = (id: number | string): Repo => this.entries[id.toString()];

    public static from_local_storage = (repos: Repo[]): RepositoryLists => {
        const repo_lists = new RepositoryLists();
        repo_lists.entries = _.keyBy(repos, r => r.id.toString());

        try {
            const repo_lists_data_raw = JSON.parse(localStorage.getItem(REPO_LISTS_KEY) ?? '[]');
            if (!Array.isArray(repo_lists_data_raw)) {
                console.error('data is not an array:', repo_lists_data_raw);
                return repo_lists;
            }
            const repo_lists_data: RepoList[] = repo_lists_data_raw
                .filter(repo_list_data_is_valid)
                .map(RepoList.from_json);

            repo_lists.lists = _.keyBy(repo_lists_data, rl => rl.id);

            repo_lists.lists[ALL_REPOS_LIST_ID] = new RepoList(
                'All',
                repos.map(r => r.id),
                ALL_REPOS_LIST_ID
            );
        } catch (error: any) {
            console.error('Failed to load repository lists from local storage:', error);
        }

        return repo_lists;
    };

    public to_local_storage = () => {
        const data = Object.values(this.lists).filter(l => l.id !== ALL_REPOS_LIST_ID);
        localStorage.setItem(REPO_LISTS_KEY, JSON.stringify(data));
    };
}
