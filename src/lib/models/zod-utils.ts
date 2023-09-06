import type { z } from 'zod';

/**
 * Inspired by: https://github.com/colinhacks/zod/issues/38#issuecomment-1411543229
 */

export interface ZClass<Shape extends z.ZodRawShape> extends Omit<z.ZodObject<Shape>, 'parse'> {
    new(data: z.input<z.ZodObject<Shape>>): z.output<z.ZodObject<Shape>>;
}

export function ZClass<T>() {
    return function <Shape extends z.ZodRawShape>(_schema: z.ZodObject<Shape>): ZClass<Shape> {
        return class {
            constructor(data: z.input<z.ZodObject<Shape>>) {
                return Object.assign(this, data);
            };
        } as any;
    }
}
