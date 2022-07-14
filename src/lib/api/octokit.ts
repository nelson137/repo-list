import { createOAuthAppAuth, type OAuthAppAuthInterface } from '@octokit/auth-oauth-app';
import { Octokit } from 'octokit';

export type OctoRest = InstanceType<typeof Octokit>['rest'];

type OctoMethod = (...args: any) => Promise<any>;
export type OctoEndpointData<E extends OctoMethod> = Awaited<ReturnType<E>>['data'];

export let auth: OAuthAppAuthInterface;

export const init = () => {
    auth = createOAuthAppAuth({
        clientType: 'oauth-app',
        clientId: import.meta.env.APP_CLIENT_ID,
        clientSecret: import.meta.env.APP_CLIENT_SECRET,
    });
};

export const octokitFactory = (token: string): Octokit => new Octokit({ auth: token });
