import { Repo } from '$lib/models/repo';
import { RepoList, RepoListStorage } from '$lib/models/repo-list';
import { generateMock } from '@anatine/zod-mock';
import type { Mock } from 'vitest';
import { z } from 'zod';

export const rand = {
    array: {
        from: <Output, Def extends z.ZodTypeDef, Input>(
            schema: z.Schema<Output, Def, Input>,
            length = 3,
        ): Output[] => generateMock(z.array(schema).length(length)),
        repo: (length = 3) => rand.array.from(Repo, length),
        repoList: (length = 3) => rand.array.from(RepoList, length),
        repoListStorage: (length = 3) => rand.array.from(RepoListStorage, length),
    },

    choice: <T>(array: T[]): T => array[rand.number(array.length - 1)],

    model: {
        repo: () => generateMock(Repo),
        repoList: () => generateMock(RepoList),
    },

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

export function createMockConsoleError(): Mock<any[], void> {
    const originalConsoleError = console.error;
    const mock = vi.fn<Parameters<typeof console.error>, ReturnType<typeof console.error>>();

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

/**
 * [Source](https://github.com/testing-library/svelte-testing-library/issues/206#issuecomment-1470158576)
 */
export function mockAnimations() {
    beforeEach(() => {
        vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
            return window.setTimeout(() => fn(Date.now()), 0);
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });
}
