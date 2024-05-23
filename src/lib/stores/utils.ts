import { derived, type Readable, type Stores, type StoresValues } from 'svelte/store';

/**
 * Define a `derived` Svelte store whose update method is asynchronous.
 * @param stores The store dependencies.
 * @param callback The update callback that runs when any of the dependencies
 * update.
 * @param initial_value The initial value for the store.
 * @returns A `Readable` store that depends on `stores`.
 */
export function async_derived<S extends Stores, T>(
    stores: S,
    callback: (values: StoresValues<S>) => Promise<T>,
    initial_value?: T,
): Readable<T> {
    let previous = 0;
    return derived(
        stores,
        ($stores, set) => {
            const start = Date.now();
            Promise.resolve(callback($stores)).then(value => {
                if (start > previous) {
                    previous = start;
                    set(value);
                }
            });
        },
        initial_value,
    );
}

export function cloneMapObj<T extends { clone: () => T }>(map: {
    [key: string]: T;
}): { [key: string]: T } {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [`${k}`, v.clone()]));
}

/**
 * Calculate a SHA-1 hash.
 * @param data The data to hash.
 * @returns The calculated hex digest of `data`.
 */
export async function hash(data: string): Promise<string> {
    const data_array = new TextEncoder().encode(data);
    const digest = await crypto.subtle.digest('SHA-1', data_array);
    const digest_array = Array.from(new Uint8Array(digest));
    return digest_array.map(b => b.toString(16).padStart(2, '0')).join('');
}
