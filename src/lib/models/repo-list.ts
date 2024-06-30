import * as _ from 'lodash-es';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

export const RepoList = z.object({
    id: z
        .string()
        .uuid()
        .optional()
        .default(() => uuid())
        .describe('The UUID of this list.'),
    name: z.string().describe('The name of this list.'),
    repo_ids: z.array(
        z.string().regex(/\d+/).describe('The IDs of the [Repos](./repo.ts) in this list.'),
    ),
});

export type RepoList = z.infer<typeof RepoList>;

export function build_repo_list(name: string, repo_ids: string[] = [], id?: string): RepoList {
    return {
        name,
        id: id ?? uuid(),
        repo_ids,
    } satisfies RepoList;
}

export const RepoListStorage = RepoList.extend({
    index: z.number().nullable(),
});

export type RepoListStorage = z.infer<typeof RepoListStorage>;
