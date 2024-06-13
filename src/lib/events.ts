export interface CreateListOkData {
    /** The name of the new repository list to be created. */
    name: string;
}

export interface CreateListModalEvents {
    ok: CreateListOkData;
}

export interface AddRepoSubmitData {
    /** The IDs of the repositories to add. */
    repo_ids: string[];
}

export interface AddRepoModalEvents {
    submit: AddRepoSubmitData;
}

export interface DeleteListYesData {
    /** The ID of the repository list. */
    list_id: string;
}

export interface DeleteListModalEvents {
    yes: DeleteListYesData;
}

export interface MoveReposSubmitData {
    /** The ID of the repository list to which to move the repositories. */
    list_id: string;
}

export interface MoveReposModalEvents {
    submit: MoveReposSubmitData;
}
