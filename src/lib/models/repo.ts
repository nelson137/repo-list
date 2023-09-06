import { z } from 'zod';
import { ZClass } from './zod-utils';

const repoBaseSchema = z.object({
    archived: z.boolean().describe(`Whether this repo is archived.`),
    description: z.string().nullable().describe(`The repo's description.`),
    disabled: z.boolean().describe(`Whether this repo is disabled.`),
    forks_count: z.number().describe('The number of forks of this repo.'),
    full_name: z.string().describe(`The repo's full name ("{owner_login}/{repo_name}").`),
    html_url: z.string().url().describe(`The URL to the repo's GitHub page.`),
    name: z.string().describe(`The repo's name.`),
    private: z.boolean().describe(`Whether the repo is private.`),
    stargazers_count: z.number().describe(`The number of stars on this repo.`),
    updated_at: z.string().describe(`The last time this repo was updated.`),
});

export const apiRepoSchema = repoBaseSchema.extend({
    id: z.number().int().positive().safe().transform(id => id.toString()).describe(`The repo's ID.`),
});

export class ApiRepo extends ZClass<Repo>()(apiRepoSchema) {
    /**
     * Deserialize, validate, and construct an instance of this model.
     * @param data The raw data.
     * @returns An instance of this model.
     */
    public static parse = (data: unknown): Repo => new Repo(apiRepoSchema.parse(data));

    public static parse_array = (data: unknown): Repo[] =>
        z.array(apiRepoSchema).parse(data).map(d => new Repo(d));

    public clone = (): Repo => new Repo(JSON.parse(JSON.stringify(this)));
}

export const repoSchema = repoBaseSchema.extend({
    id: z.string().regex(/\d+/).describe(`The repo's ID.`),
});

export class Repo extends ZClass<Repo>()(repoSchema) {
    /**
     * Deserialize, validate, and construct an instance of this model.
     * @param data The raw data.
     * @returns An instance of this model.
     */
    public static parse = (data: unknown): Repo => new Repo(repoSchema.parse(data));

    public static parse_array = (data: unknown): Repo[] =>
        z.array(repoSchema).parse(data).map(d => new Repo(d));

    public clone = (): Repo => new Repo(JSON.parse(JSON.stringify(this)));
}
