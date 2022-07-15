import type { LoadOutput, RequestHandlerOutput } from '@sveltejs/kit';

export enum EndpointErrorReason {
    Auth = 'auth',
    GithubError = 'github-error',
    NoToken = 'no-token',
}

export type EndpointError = {
    reason: EndpointErrorReason;
    message?: string;
};

export type EndpointErrorBody = {
    error?: EndpointError;
};

export function endpoint_err(
    status: number,
    reason: EndpointErrorReason,
    message?: string
): RequestHandlerOutput<EndpointErrorBody> {
    return {
        status,
        body: {
            error: {
                reason,
                message,
            },
        },
    };
}

export function handle_endpoint_error<P>(status: number, data: any): LoadOutput<P> {
    let error = 'An unknown error occurred';
    switch (data.reason) {
        case EndpointErrorReason.NoToken:
            error = 'No token';
            break;
        case EndpointErrorReason.GithubError:
            error = `GitHub returned an error: ${data.message}`;
            break;
    }
    return {
        status,
        error,
    };
}
