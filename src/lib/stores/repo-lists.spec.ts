import { REPO_LISTS_KEY, RepositoryListsData, read_local_storage } from "./repo-lists";
import { createMockConsoleError, rand } from "$test/utils";

describe('RepositoryListsData', () => {
    let sut: RepositoryListsData;

    function fillSut() {
        const lists = rand.array.repoListStorage();
        const repo_ids = new Set(lists.flatMap(l => l.repo_ids));
        if (repo_ids.size === 0)
            throw 'generated array of repo lists has no repositories';

        const repos = rand.array.repo(repo_ids.size);
        let i = 0;
        for (const id of repo_ids) repos[i++].id = id;

        sut.load(lists);
    }

    beforeEach(() => {
        sut = new RepositoryListsData();
    });

    describe('load', () => {
        it('should load lists', () => {
            const lists = rand.array.repoListStorage();
            const expectedListsMap = Object.fromEntries(lists.map(l => [l.id, l]));

            sut.load(lists);

            expect(sut.lists).toMatchObject(expectedListsMap);
        });

        it('should calculate the list order', () => {
            const lists = rand.array.repoListStorage();
            lists[0].index = 2;
            lists[1].index = 1;
            lists[2].index = 0;
            const expectedListOrder = lists.map(l => l.id).reverse();

            sut.load(lists);

            expect(sut.list_order).toMatchObject(expectedListOrder);
        });

        it('should automatically load the special All Repos list', () => {
            sut.load([]);
            const actualLists = Object.keys(sut.lists);

            expect(actualLists).toEqual([]);
            expect(sut.list_order).toEqual([]);
        });
    });

    describe('get_repo_lists', () => {
        const mockConsoleError = createMockConsoleError();

        it('should return the lists as an array', () => {
            fillSut();
            const expectedLists = sut.list_order.map(id => sut.lists[id]);

            const actualLists = sut.get_repo_lists();

            expect(actualLists).toEqual(expectedLists);
        });

        it('should log and ignore a list ID that does not exist', () => {
            sut.load([]);
            const unexpectedId = rand.uuid();
            sut.list_order.push(unexpectedId);

            const actualLists = sut.get_repo_lists();

            expect(mockConsoleError).toHaveBeenCalledOnce();
            expect(mockConsoleError.mock.lastCall.join(' ')).toContain(unexpectedId);
            expect(actualLists).toEqual([]);
        });
    });

    describe('get_list', () => {
        it('should return the repo list with the given ID', () => {
            fillSut();
            const id = rand.choice(sut.list_order);
            const expectedList = sut.lists[id];

            let actualList = sut.get_list(id);

            expect(actualList).toEqual(expectedList);
        });

        it('should return undefined for an unexpected ID', () => {
            const unexpectedId = rand.uuid();

            const actualList = sut.get_list(unexpectedId);

            expect(actualList).toBeUndefined();
        });
    });

    describe('add_list', () => {
        it('should prepend a list', () => {
            fillSut();
            const list = rand.model.repoList();

            sut.add_list(list);

            expect(sut.list_order[0]).toEqual(list.id);
            expect(sut.lists[list.id]).toEqual(list);
        });
    });

    describe('delete_list', () => {
        const mockConsoleError = createMockConsoleError();

        it('should remove the list from the order array', () => {
            fillSut();
            const id = rand.choice(sut.list_order);

            sut.delete_list(id);

            expect(sut.list_order).not.toContain(id);
        });

        it('should log when the ID does not exist in the order array', () => {
            fillSut();
            const id = rand.choice(sut.list_order);
            sut.list_order.splice(sut.list_order.indexOf(id), 1);

            sut.delete_list(id);

            expect(mockConsoleError).toHaveBeenCalledOnce();
            expect(mockConsoleError.mock.lastCall.join(' ')).toContain(id);
        });

        it('should remove the list from the lists map', () => {
            fillSut();
            const id = rand.choice(sut.list_order);

            sut.delete_list(id);

            expect(sut.lists).not.toHaveProperty(id);
        });

        it('should log when the ID does not exist in the lists map', () => {
            fillSut();
            const id = rand.choice(sut.list_order);
            delete sut.lists[id];

            sut.delete_list(id);

            expect(mockConsoleError).toHaveBeenCalledOnce();
            expect(mockConsoleError.mock.lastCall.join(' ')).toContain(id);
        });
    });
});

describe('read_local_storage', () => {
    const mockConsoleError = createMockConsoleError();
    const spyGetItem = vi.fn();

    beforeAll(() => {
        vi.stubGlobal('localStorage', {
            getItem: spyGetItem,
            setItem: vi.fn(),
        });
    });

    afterEach(() => {
        spyGetItem.mockRestore();
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    function compareLists<T extends { id: string }>(a: T, b: T): number {
        return a.id.localeCompare(b.id);
    }

    it('should parse and return the data from local storage', () => {
        const expectedLists = rand.array.repoListStorage().sort(compareLists);
        spyGetItem.mockImplementation(() => JSON.stringify(expectedLists));

        const actualLists = read_local_storage();

        expect(localStorage.getItem).toHaveBeenCalledWith(REPO_LISTS_KEY);
        expect(actualLists.sort(compareLists)).toEqual(expectedLists);
    });

    it('should return an empty array when no data is in local storage', () => {
        spyGetItem.mockImplementation(() => undefined);

        const actualLists = read_local_storage();

        expect(actualLists).toEqual([]);
    });

    it('should log and return an empty array when JSON parsing local storage fails', () => {
        spyGetItem.mockImplementation(() => 'invalid json');

        const actualLists = read_local_storage();

        expect(mockConsoleError).toHaveBeenCalledOnce();
        expect(mockConsoleError.mock.lastCall.join(' '))
            .toContain('Failed to load repository lists from local storage:');
        expect(actualLists).toEqual([]);
    });

    it('should log and return an empty array when the local storage data is not an array', () => {
        spyGetItem.mockImplementation(() => '{}');

        const actualLists = read_local_storage();

        expect(mockConsoleError).toHaveBeenCalledOnce();
        expect(mockConsoleError.mock.lastCall.join(' ')).toContain('data is not an array');
        expect(actualLists).toEqual([]);
    });

    it('should log and return an empty array when validating the local storage data fails', () => {
        spyGetItem.mockImplementation(() => '[{"invalidKey":"invalidValue"}]');

        const actualLists = read_local_storage();

        expect(mockConsoleError).toHaveBeenCalledOnce();
        expect(mockConsoleError.mock.lastCall.join(' ')).toContain('"code": "invalid_type"');
        expect(actualLists).toEqual([]);
    });
});
