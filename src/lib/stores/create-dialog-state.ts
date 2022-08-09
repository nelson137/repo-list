import { get, writable, type Writable } from 'svelte/store';

export enum DialogAction {
    NotOpen,
    Canceled,
    Waiting,
    Ok,
}

type DialogState = {
    action: DialogAction;
    name: string | null;
};

const dialog_state: Writable<DialogState> = writable({
    action: DialogAction.NotOpen,
    name: null,
});

export const set_dialog_state = (action: DialogAction, name?: DialogState['name']) =>
    dialog_state.update(prev_state => ({
        action,
        name: name === undefined ? prev_state.name : name,
    }));

export const get_dialog_state = (): DialogState => get(dialog_state);
