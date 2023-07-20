import type { OctoEndpointData, OctoRest } from '$lib/api/octokit';
import { Expose } from 'class-transformer';
import { from_json } from './_model';

type EndpointData = OctoEndpointData<OctoRest['repos']['listForAuthenticatedUser']>[number];

export class Repo {
    /** Whether this repo is archived. */
    @Expose() archived: boolean;
    /** The repo's description. */
    @Expose() description: string;
    /** Whether this repo is disabled. */
    @Expose() disabled: boolean;
    /** The number of forks of this repo. */
    @Expose() forks_count: number;
    /** The repo's full name ("{owner_login}/{repo_name}"). */
    @Expose() full_name: string;
    /** The URL to the repo's GitHub page. */
    @Expose() html_url: string;
    /** The repo's ID. */
    @Expose() id: number;
    /** The repo's name */
    @Expose() name: string;
    /** Whether the repo is private. */
    @Expose() private: boolean;
    /** The number of stars on this repo. */
    @Expose() stargazers_count: number;
    /** The last time this repo was updated. */
    @Expose() updated_at: string;

    /**
     * Deserialize an instance of this model.
     * @param data The raw JSON object data from GitHub's API endpoint.
     * @returns An instance of this model from `data`.
     */
    public static from_json = (data: Partial<EndpointData>): Repo => from_json(Repo, data);

    /**
     * Deserialize an array of instances of this model.
     * @param data The raw JSON array data from GitHub's API endpoint.
     * @returns An array of instances of this model from `data`.
     */
    public static from_json_array = (data: Partial<EndpointData>[]): Repo[] =>
        from_json(Repo, data);
}
