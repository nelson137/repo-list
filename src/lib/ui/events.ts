export type CreateListOkData = {
    /**
     * The name of the new list to be created from the user.
     */
    name: string;
};

export type CreateListEvents = {
    canceled: undefined;
    ok: CreateListOkData;
};

export type AddRepoSubmitData = {
    /** The IDs of the repositories to add. */
    repo_ids: number[];
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
