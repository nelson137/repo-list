import { render, screen } from '@testing-library/svelte';
import RepoCard from './RepoCard.svelte';
import { mockAnimations, rand } from '$test/utils';
import type { Repo } from '$lib/models/repo';

describe('RepoCard component', () => {
    mockAnimations();

    let repo: Repo;
    let props: {
        repo: Repo;
        id: string;
        list_id: string;
        index: number;
        bulk_delete_selected: boolean;
    };

    beforeEach(() => {
        repo = rand.model.repo();
        props = {
            repo,
            id: repo.id,
            list_id: rand.uuid(),
            index: rand.number(9),
            bulk_delete_selected: false,
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
