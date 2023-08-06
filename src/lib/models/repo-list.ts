import * as _ from 'lodash-es';
import { v4 as uuid } from 'uuid';
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
