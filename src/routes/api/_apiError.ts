export enum ApiErrorReason {
    GithubError = 'github-error',
    NoToken = 'no-token',
}

export type ApiError = {
    status: number;
    reason: ApiErrorReason;
    message?: string;
};
