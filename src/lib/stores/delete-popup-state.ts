import { get, writable, type Writable } from 'svelte/store';

export enum PopupState {
    Canceled,
    Deciding,
    No,
    Yes,
}

type AllPopupStates = {
    [id: string]: PopupState;
};

const popup_state: Writable<AllPopupStates> = writable({});

export const set_popup_state = (id: string, state: PopupState) =>
    popup_state.update(all_states => ({ ...all_states, [id]: state }));

export const get_popup_state = (id: string): PopupState => get(popup_state)[id];
