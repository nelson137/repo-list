export type CardDragStartData = {
    /**
     * The index of the card being dragged.
     */
    index: number;
    /**
     * The element ID of the source list from which the card being dragged.
     */
    list_id: string;
};

export type DeleteListEvents = {
    canceled: undefined;
    no: undefined;
    yes: undefined;
};
