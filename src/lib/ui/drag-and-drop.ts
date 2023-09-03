export type _DragEvent = DragEvent & { currentTarget: EventTarget & HTMLElement };

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
