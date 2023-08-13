import type { Side } from "$lib/drag-and-drop";
import { get, writable } from "svelte/store";

export type DragSource = {
    /**
     * The ID of the list from which the card is being dragged.
     */
    list_id: string;

    /**
     * The index of the card being dragged in the source list.
     */
    index: number;
};

export type DragIndicator = {
    /**
     * The index of the repository card closest to the mouse.
     */
    index: number;

    /**
     * The side of the repostiroy card that is closest to the mouse.
     */
    side: Side;
};

export class RepoCardDragData {
    /**
     * The source location of the repository drag.
     */
    public source: DragSource;

    /**
     * The drag indicator -- the repository card closest to the mouse.
     * mouse.
     */
    public indicator: DragIndicator | null;

    constructor(source: DragSource, indicator: DragIndicator | null = null) {
        this.source = source;
        this.indicator = indicator;
    }

    public clone = (): RepoCardDragData => {
        const { source, indicator } = JSON.parse(JSON.stringify(this));
        return new RepoCardDragData(source, indicator);
    };
}

export class RepoCardDrag {
    private store = writable<RepoCardDragData | null>(null);

    /**
     * Update the repository card drag store data, immutably.
     * @param callback The callback that takes a copy of the current store value
     * and updates it.
     */
    private update = (callback: (nextData: RepoCardDragData) => void) =>
        this.store.update(old_data => {
            if (old_data === null)
                throw 'Cannot update drag data, there is no ongoing drag session';
            const new_data = old_data.clone();
            callback(new_data);
            return new_data;
        });

    /**
     * Start a new drag session.
     * @param list_id The ID of the list from which the card is being dragged.
     * @param index The index of the card in the source list.
     */
    public drag_start = (list_id: string, index: number) =>
        this.store.set(new RepoCardDragData({ list_id, index }));

    /**
     * Update the indicator location.
     * @param closest_i The index of the card closest to the mouse in the list
     * being dragged over.
     * @param closest_side The side of the `closest_i`th card closest to the
     * mouse.
     */
    public drag_over = (closest_i: number, closest_side: Side) => this.update(data => {
        data.indicator = { index: closest_i, side: closest_side };
    });

    /**
     * End the current drag session.
     */
    public drag_end = () => this.store.set(null);

    /**
     * Get the source of the current drag.
     */
    public get_drag_source = () => {
        const data = get(this.store);
        if (data === null) throw 'Cannot get drag source, there is no ongoing drag session';
        return data.source;
    };

    /**
     * Get the current location of the drag indicator.
     */
    public get_indicator_loc = () => {
        const data = get(this.store);
        if (data === null) throw 'Cannot get indicator location, there is no ongoing drag session';
        return data.indicator;
    };
}

export const repo_drag = new RepoCardDrag();
