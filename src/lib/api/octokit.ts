import { Octokit } from 'octokit';

export let octokit: Octokit;

export const init = () => {
    octokit = new Octokit({
        auth: import.meta.env.APP_GITHUB_ACCESS_TOKEN,
    });
};
