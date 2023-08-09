import { generateMock } from "@anatine/zod-mock";
import { z } from "zod";

export const rand = {
    choice: <T>(array: T[]): T => array[rand.number(array.length - 1)],

    /**
     * Arguments (a) returns a number in the range [0,a].
     * Arguments (a, b) returns a number in the range [a,b].
     */
    number: (a: number, b?: number): number => {
        if (b === undefined) return generateMock(z.number().max(a));
        return generateMock(z.number().min(a).max(b));
    },

    uuid: (): string => generateMock(z.string().uuid()),
};

export function createMockConsoleError() {
    const originalConsoleError = console.error;
    const mock = vi.fn();

    beforeAll(() => {
        console.error = mock;
    });

    beforeEach(() => {
        mock.mockReset();
    });

    afterAll(() => {
        console.error = originalConsoleError;
    });

    return mock;
}
