import type { z } from 'zod';

export function parse_array<Output, Def extends z.ZodTypeDef, Input>(
    schema: z.Schema<Output, Def, Input>,
    data: Input[],
): Output[] {
    return data.map(item => schema.parse(item));
}
