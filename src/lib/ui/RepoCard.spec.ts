import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/svelte';
import RepoCard from './RepoCard.svelte';
import { mockAnimations, rand } from '$test/utils';
import type { Repo } from '$lib/models/repo';

describe('RepoCard component', () => {
    mockAnimations();

    let repo: Repo;
    let props: {
        repo: Repo;
        id: number;
        list_id: string;
        index: number;
        card_disabled: boolean;
    };

    beforeEach(() => {
        repo = rand.model.repo()
        props = {
            repo,
            id: repo.id,
            list_id: rand.uuid(),
            index: rand.number(9),
            card_disabled: false,
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

    it('should show the open link on hover and hide it on unhover', async () => {
        render(RepoCard, props);
        const card = screen.getByTestId('card');

        await fireEvent.mouseEnter(card);
        const element = screen.getByTestId<HTMLAnchorElement>('open-link');
        expect(element.href).toMatch(repo.html_url);

        await fireEvent.mouseLeave(card);
        await waitForElementToBeRemoved(() => screen.getByTestId('open-link'));
    });
});
