import { repoSchema } from "$lib/models/repo";
import { repoListSchema, repoListStorageSchema } from "$lib/models/repo-list";
import { z } from "zod";
import { ALL_REPOS_LIST_ID, RepositoryListsData } from "./repo-lists";
import { generateMock } from "@anatine/zod-mock";
import { createMockConsoleError, rand } from "$test/utils";

describe('RepositoryListsData', () => {
    let sut: RepositoryListsData;

    function fillSut() {
        const lists = generateMock(z.array(repoListStorageSchema).length(3));
        const repo_ids = new Set(lists.flatMap(l => l.repo_ids));
        if (repo_ids.size === 0)
            throw 'generated array of repo lists has no repositories';

        const repos = generateMock(z.array(repoSchema).length(repo_ids.size));
        let i = 0;
        for (const id of repo_ids) repos[i++].id = id;

        sut.load(repos, lists);
    }

    beforeEach(() => {
        sut = new RepositoryListsData();
    });

    describe('load', () => {
        it('should load repositories', () => {
            const repos = generateMock(z.array(repoSchema).length(3));
            const expectedReposMap = Object.fromEntries(repos.map(r => [r.id, r]));

            sut.load(repos, []);

            expect(sut.repositories).toEqual(expectedReposMap);
        });

        it('should load lists', () => {
            const lists = generateMock(z.array(repoListStorageSchema).length(3));
            const expectedListsMap = Object.fromEntries(lists.map(l => [l.id, l]));

            sut.load([], lists);

            expect(sut.lists).toMatchObject(expectedListsMap);
        });

        it('should calculate the list order', () => {
            const lists = generateMock(z.array(repoListStorageSchema).length(3));
            lists[0].index = 2;
            lists[1].index = 1;
            lists[2].index = 0;
            const expectedListOrder = lists.map(l => l.id).reverse().concat([ALL_REPOS_LIST_ID]);

            sut.load([], lists);

            expect(sut.list_order).toMatchObject(expectedListOrder);
        });

        it('should automatically load the special All Repos list', () => {
            sut.load([], []);
            const actualLists = Object.keys(sut.lists);

            expect(actualLists).toEqual([ALL_REPOS_LIST_ID]);
            expect(sut.list_order).toEqual([ALL_REPOS_LIST_ID]);
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
            sut.load([], []);
            const unexpectedId = rand.uuid();
            sut.list_order.push(unexpectedId);

            const actualLists = sut.get_repo_lists();

            expect(mockConsoleError).toHaveBeenCalledOnce();
            expect(mockConsoleError.mock.lastCall.join(' ')).toContain(unexpectedId);
            expect(actualLists).toHaveLength(1);
            expect(actualLists[0].id).toEqual(ALL_REPOS_LIST_ID);
        });
    });

    describe('get_repo', () => {
        it('should return the repository with the given ID', () => {
            fillSut();
            const expectedRepo = rand.choice(Object.values(sut.repositories));

            const actualRepo = sut.get_repo(expectedRepo.id);

            expect(actualRepo).toEqual(expectedRepo);
        });

        it('should return undefined for an unexpected ID', () => {
            const unexpectedId = rand.uuid();

            const actualRepo = sut.get_repo(unexpectedId);

            expect(actualRepo).toBeUndefined();
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
            const list = generateMock(repoListSchema);

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
