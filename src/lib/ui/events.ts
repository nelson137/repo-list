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

export type DeleteListEvents = {
    canceled: undefined;
    no: undefined;
    yes: undefined;
};
