/// <reference types="@sveltejs/kit" />

export { };

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    declare namespace App {
        interface Locals {
            debug_data: boolean;
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
