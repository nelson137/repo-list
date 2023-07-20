/// <reference types="@sveltejs/kit" />

export { };

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    interface ImportMetaEnv {
        APP_GITHUB_ACCESS_TOKEN: string;
        APP_CLIENT_ID: string;
        APP_CLIENT_SECRET: string;
        APP_GITHUB_REDIRECT_BASE_URL: string;
    }

    declare namespace App {
        interface Locals {
            token?: string;
        }

        interface Error {
            reason?: string;
            message: string;
        }

        // interface Platform {}
        // interface Session {}
    }
}
