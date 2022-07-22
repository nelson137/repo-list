export type _DragEvent = DragEvent & { currentTarget: EventTarget & HTMLElement };

export const DRAG_DATA__REPO_ID = 'application/repo-card-id';
export const DRAG_DATA__SRC_LIST_ID = 'application/repo-card-source-list-id';

export enum Side {
    Before,
    After,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Side {
    export const toStr = (side: Side): string => {
        switch (side) {
            case Side.Before:
                return 'before';
            case Side.After:
                return 'after';
        }
    };

    export const toOppositeStr = (side: Side): string => {
        switch (side) {
            case Side.Before:
                return Side.toStr(Side.After);
            case Side.After:
                return Side.toStr(Side.Before);
        }
    };
}
