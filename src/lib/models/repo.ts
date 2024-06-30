import { z } from 'zod';

export const RepoBase = z.object({
    archived: z.boolean().describe(`Whether this repo is archived.`),
    description: z.string().nullable().describe(`The repo's description.`),
    disabled: z.boolean().describe(`Whether this repo is disabled.`),
    forks_count: z.number().describe('The number of forks of this repo.'),
    full_name: z.string().describe(`The repo's full name ("{owner_login}/{repo_name}").`),
    html_url: z.string().url().describe(`The URL to the repo's GitHub page.`),
    name: z.string().describe(`The repo's name.`),
    private: z.boolean().describe(`Whether the repo is private.`),
    stargazers_count: z.number().describe(`The number of stars on this repo.`),
    updated_at: z.string().nullable().describe(`The last time this repo was updated.`),
});

export const ApiRepo = RepoBase.extend({
    id: z
        .number()
        .int()
        .positive()
        .safe()
        .transform(id => id.toString())
        .describe(`The repo's ID.`),
});

export type ApiRepo = z.infer<typeof ApiRepo>;

export const Repo = RepoBase.extend({
    id: z.string().regex(/\d+/).describe(`The repo's ID.`),
});

export type Repo = z.infer<typeof Repo>;
