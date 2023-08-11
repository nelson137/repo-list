import type { OctoEndpointData, OctoRest } from '$lib/server/api/octokit';
import { Expose } from 'class-transformer';
import { from_json } from './_model';

type EndpointData = OctoEndpointData<OctoRest['users']['getAuthenticated']>;

export class User {
    /** URL of the user's profile picture (AKA avatar). */
    @Expose() avatar_url: string;
    /** URL the user's profile. */
    @Expose() html_url: string;
    /** The user's ID. */
    @Expose() id: number;
    /** The user's username. */
    @Expose() login: string;
    /** The user's full name. */
    @Expose() name: string;

    /**
     * Deserialize an instance of this model.
     * @param data The raw JSON object data from GitHub's API endpoint.
     * @returns An instance of this model from `data`.
     */
    public static from_json = (data: Partial<EndpointData>): User => from_json(User, data);

    /**
     * Deserialize an array of instances of this model.
     * @param data The raw JSON array data from GitHub's API endpoint.
     * @returns An array of instances of this model from `data`.
     */
    public static from_json_array = (data: Partial<EndpointData>[]): User[] =>
        from_json(User, data);
}
