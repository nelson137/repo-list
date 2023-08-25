import { get, writable, type Writable } from 'svelte/store';

export enum ModalAction {
    Canceled,
    Deciding,
    Submitted,
}

export type ModalState = {
    action: ModalAction.Canceled | ModalAction.Deciding,
} | {
    action: ModalAction.Submitted,
    repo_ids: number[],
};

type AllModalStates = {
    [id: string]: ModalState;
};

const modal_states: Writable<AllModalStates> = writable({});

export const set_modal_state = (id: string, state: ModalState) =>
    modal_states.update(all_states => ({ ...all_states, [id]: state }));

export const get_modal_state = (id: string): ModalState => get(modal_states)[id];
