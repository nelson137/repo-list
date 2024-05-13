export type CreateListOkData = {
    /** The name of the new repository list to be created. */
    name: string;
};

export type CreateListModalEvents = {
    ok: CreateListOkData;
};

export type AddRepoSubmitData = {
    /** The IDs of the repositories to add. */
    repo_ids: string[];
};

export type AddRepoModalEvents = {
    submit: AddRepoSubmitData;
};

export type DeleteListYesData = {
    /** The ID of the repository list. */
    list_id: string;
};

export type DeleteListModalEvents = {
    yes: DeleteListYesData;
};

export type MoveReposSubmitData = {
    /** The ID of the repository list to which to move the repositories. */
    list_id: string;
};

export type MoveReposModalEvents = {
    submit: MoveReposSubmitData;
}
