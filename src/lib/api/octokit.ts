import { Octokit } from 'octokit';

export type OctoRest = InstanceType<typeof Octokit>['rest'];

type OctoMethod = (...args: any) => Promise<any>;
export type OctoEndpointData<E extends OctoMethod> = Awaited<ReturnType<E>>['data'];

export let octokit: Octokit;

export const init = () => {
    octokit = new Octokit({
        auth: import.meta.env.APP_GITHUB_ACCESS_TOKEN,
    });
};
