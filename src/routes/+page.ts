import {
    DRAG_DATA__REPO_ID,
    DRAG_DATA__REPO_INDEX,
    DRAG_DATA__SRC_LIST_ID,
    Side,
    type _DragEvent,
} from '$lib/drag-and-drop';
import { EndpointErrorReason, handle_endpoint_err } from '$lib/error';
import { Repo } from '$lib/models/repo';
import { ALL_REPOS_LIST_ID, RepoList, RepositoryLists } from '$lib/models/repo-list';
import CreateListDialogTrigger from '$lib/ui/CreateListDialogTrigger.svelte';
import DeleteListPopupTrigger from '$lib/ui/DeleteListPopupTrigger.svelte';
import type { CardDragStartData, CreateListOkData } from '$lib/ui/events';
import RepoCard from '$lib/ui/RepoCard.svelte';
import { dist } from '$lib/util';
import type { LoadEvent } from '@sveltejs/kit';
import { onMount } from 'svelte';
import Modal from 'svelte-simple-modal';
import { flip } from 'svelte/animate';
import type { PageLoad } from './$types';

type InProps = {};
type OutProps = {
    logged_in: boolean;
    repos: Repo[] | null;
};

throw new Error("@migration task: Migrate the load function input (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
export const load: PageLoad<InProps, OutProps> = async ({ fetch, stuff }: LoadEvent) => {
    if (!stuff.logged_in) {
        return {
    logged_in: stuff.logged_in ?? false,
    repos: null,
};
    }

    try {
        const response = await fetch('/api/github/repos');
        const data = await response.json();
        if (data.error) throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
        return handle_endpoint_err(data.error);
        return {
    logged_in: stuff.logged_in ?? false,
    repos: Repo.from_json_array(data.repos || []),
};
    } catch (error: any) {
        throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
        return handle_endpoint_err({
            status: 400,
            reason: EndpointErrorReason.Other,
            message: `An unexpected error occurred while fetching user repositories: ${error.message}`,
        });
    }
};
