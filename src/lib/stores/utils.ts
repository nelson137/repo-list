export function cloneMapObj<T extends { clone: () => T }>(
    map: { [key: string]: T }
): { [key: string]: T } {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [`${k}`, v.clone()]));
}
