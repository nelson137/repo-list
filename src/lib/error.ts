import type { LoadOutput, RequestHandlerOutput } from '@sveltejs/kit';

export enum EndpointErrorReason {
    Auth_Callback_NoCode = 'auth-no-code',
    Auth_Callback_NullCode = 'auth-null-code',
    Auth_NoToken = 'auth-no-token',
    Github = 'github',
    Other = 'other',
}

export type EndpointError = {
    status: number;
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
        status: 200,
        body: endpoint_err_body(status, reason, message),
    };
}

export function endpoint_err_body(
    status: number,
    reason: EndpointErrorReason,
    message?: string
): EndpointErrorBody {
    return {
        error: { status, reason, message },
    };
}

export function handle_endpoint_err<P>(data: EndpointError): LoadOutput<P> {
    let error = 'An unknown error occurred';
    switch (data.reason) {
        case EndpointErrorReason.Auth_Callback_NoCode:
            error = 'GitHub authentication redirected with no temporary code';
            break;
        case EndpointErrorReason.Auth_Callback_NullCode:
            error = 'GitHub authentication redirected with a null temporary code';
            break;
        case EndpointErrorReason.Auth_NoToken:
            error = 'No authentication token';
            break;
        case EndpointErrorReason.Github:
            error = `GitHub Error: ${data.message}`;
            break;
        case EndpointErrorReason.Other:
            if (data.message) error = data.message;
            break;
    }
    return {
        status: data.status,
        error,
    };
}
