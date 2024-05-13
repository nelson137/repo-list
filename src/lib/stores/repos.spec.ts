import { rand } from '$test/utils';
import { RepositoriesData } from './repos';

describe('RepositoriesData', () => {
    let sut: RepositoriesData;

    beforeEach(() => {
        sut = new RepositoriesData();
    });

    describe('load', () => {
        it('should load repositories', () => {
            const repos = rand.array.repo();
            const expectedReposMap = Object.fromEntries(repos.map(r => [r.id, r]));

            sut.load(repos);

            expect(sut.repositories).toEqual(expectedReposMap);
        });
    });

    describe('get_repo', () => {
        it('should return the repository with the given ID', () => {
            const repos = rand.array.repo();
            sut.load(repos);
            const expectedRepo = rand.choice(repos);

            const actualRepo = sut.get_repo(expectedRepo.id);

            expect(actualRepo).toEqual(expectedRepo);
        });

        it('should return undefined for an unexpected ID', () => {
            const unexpectedId = rand.uuid();

            const actualRepo = sut.get_repo(unexpectedId);

            expect(actualRepo).toBeUndefined();
        });
    });
});
