import { error } from '@sveltejs/kit';

export enum EndpointErrorReason {
    Auth_Callback_NoCode = 'auth-no-code',
    Auth_Callback_NullCode = 'auth-null-code',
    Auth_NoToken = 'auth-no-token',
    Github = 'github',
    Other = 'other',
}

function endpoint_err_message(reason: EndpointErrorReason, message?: string): string {
    const UNKNOWN_ERR_MSG = 'An unknown error occurred';
    switch (reason) {
        case EndpointErrorReason.Auth_Callback_NoCode:
            return 'GitHub authentication redirected with no temporary code';
        case EndpointErrorReason.Auth_Callback_NullCode:
            return 'GitHub authentication redirected with a null temporary code';
        case EndpointErrorReason.Auth_NoToken:
            return 'No authentication token';
        case EndpointErrorReason.Github:
            return `GitHub Error: ${message}`;
        case EndpointErrorReason.Other:
            return message ?? UNKNOWN_ERR_MSG;
    }
}

export function endpoint_err_body(
    reason: EndpointErrorReason,
    message?: string,
): App.Error {
    return {
        message: endpoint_err_message(reason, message)
    };
}

export function endpoint_err<Data>(
    status: number,
    reason: EndpointErrorReason,
    message?: string,
): Data {
    throw error(status, endpoint_err_body(reason, message));
}
