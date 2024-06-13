import { __GITHUB_CLIENT_ID, __GITHUB_CLIENT_SECRET } from '$env/static/private';
import { createOAuthAppAuth, type OAuthAppAuthInterface } from '@octokit/auth-oauth-app';
import { Octokit } from 'octokit';

export type OctoRest = InstanceType<typeof Octokit>['rest'];

type OctoMethod = (...args: any) => Promise<any>;
export type OctoEndpointData<E extends OctoMethod> = Awaited<ReturnType<E>>['data'];

export interface OktokitErrorResponseData {
    message: string;
    documentation_url: string;
    status: string;
}

export let auth: OAuthAppAuthInterface;

export const init = () => {
    auth = createOAuthAppAuth({
        clientType: 'oauth-app',
        clientId: __GITHUB_CLIENT_ID,
        clientSecret: __GITHUB_CLIENT_SECRET,
    });
};

export function octokitFactory(token?: string): Octokit {
    if (token == null) throw new Error('Token is null or undefined');
    return new Octokit({ auth: token });
}
