import * as _ from 'lodash-es';
import { v4 as uuid } from 'uuid';
import type { Repo } from './repo';
import { z } from 'zod';
import { ZClass } from './zod-utils';

const repoListSchema = z.object({
    id: z.string().optional().default(() => uuid()).describe('The UUID of this list.'),
    name: z.string().describe('The name of this list.'),
    repo_ids: z.array(z.number().describe('The IDs of the [Repos](./repo.ts) in this list.')),
});

export class RepoList extends ZClass<RepoList>()(repoListSchema) {
    public static from(name: string, repo_ids: number[] = [], id?: string): RepoList {
        return new RepoList({
            name,
            id: id ?? uuid(),
            repo_ids,
        });
    }

    /**
     * Deserialize, validate, and construct an instance of this model.
     * @param data The raw data.
     * @returns An instance of this model.
     */
    public static parse = (data: unknown): RepoListStorage => repoListStorageSchema.parse(data);
}

const repoListStorageSchema = repoListSchema.extend({
    index: z.number().nullable(),
});

export class RepoListStorage extends ZClass<RepoListStorage>()(repoListStorageSchema) {
    /**
     * Deserialize, validate, and construct an instance of this model.
     * @param data The raw data.
     * @returns An instance of this model.
     */
    public static parse = (data: unknown): RepoListStorage => repoListStorageSchema.parse(data);
}

export const REPO_LISTS_KEY = 'repo-lists';

export const ALL_REPOS_LIST_ID = '80ff2230-8456-451c-b2ac-eba72e26bcb9';

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

    public load_repositories = (repos: Repo[]) => {
        this.repositories = _.keyBy(repos, r => r.id.toString());
    };

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

    public get_list = (id: string): RepoList => this.lists[id];

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

    public load_lists = (lists: RepoListStorage[]): RepositoryLists => {
        this.lists = _.keyBy(lists.map(s => new RepoList(s)), rl => rl.id);
        this.lists[ALL_REPOS_LIST_ID] = RepoList.from(
            'All',
            Object.values(this.repositories).map(r => r.id),
            ALL_REPOS_LIST_ID
        );

        const order: string[] = [];
        for (const l of lists) {
            if (l.index !== null) {
                order[l.index] = l.id;
            } else {
                console.warn('Skipping list from local storage with no index:', l);
            }
        }
        this.list_order = order.filter(id => id !== undefined).concat([ALL_REPOS_LIST_ID]);

        return this;
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
