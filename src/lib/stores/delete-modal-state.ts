import { get, writable, type Writable } from 'svelte/store';

export enum ModalState {
    Canceled,
    Deciding,
    No,
    Yes,
}

type AllModalStates = {
    [id: string]: ModalState;
};

const modal_state: Writable<AllModalStates> = writable({});

export const set_modal_state = (id: string, state: ModalState) =>
    modal_state.update(all_states => ({ ...all_states, [id]: state }));

export const get_modal_state = (id: string): ModalState => get(modal_state)[id];
