import type { Repo } from '$lib/models/repo';
import { mockAnimations, rand } from '$test/utils';
import { render, screen } from '@testing-library/svelte';
import RepoCard from './RepoCard.svelte';

describe('RepoCard component', () => {
    mockAnimations();

    let repo: Repo;
    let props: {
        repo: Repo;
        id: string;
        list_id: string;
        index: number;
    };

    beforeEach(() => {
        repo = rand.model.repo();
        props = {
            repo,
            id: repo.id,
            list_id: rand.uuid(),
            index: rand.number(9),
        };
    });

    it('should have the repository name', () => {
        render(RepoCard, props);
        const element = screen.getByTestId('name');
        expect(element).toHaveTextContent(repo.name);
    });

    it('should have the repository stargazers count', () => {
        render(RepoCard, props);
        const element = screen.getByTestId('stargazers-count');
        expect(element).toHaveTextContent(`${repo.stargazers_count}`);
    });

    it('should have the repository forks count', () => {
        render(RepoCard, props);
        const element = screen.getByTestId('forks-count');
        expect(element).toHaveTextContent(`${repo.forks_count}`);
    });
});
