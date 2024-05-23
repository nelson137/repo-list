import { ComponentType, SvelteComponent } from 'svelte';
import type { Writable } from 'svelte/store';

export { };

declare module 'svelecte' {
    type Item = {
        value?: unknown;
        label?: string;
    };

    interface Svelecte_Props {
        // Bindable
        value?: Item | Item[] | null; // null
        readSelection?: Item | Item[] | null; // null

        // Inputs
        allowEditing?: boolean; // false
        alwaysCollapsed?: boolean; // false
        class?: string; // 'svelecte-control'
        clearable?: boolean; // false
        closeAfterSelect?: boolean; // false
        collapseSelection?: boolean; // false
        controlItem?: ComponentType; // import('svelecte/components/Item.svelte')
        creatable?: boolean; // false
        creatablePrefix?: string; // '*'
        createFilter?: ((inputValue: string) => boolean) | null; // null
        createTransform?:
            | ((
                  inputValue: string,
                  creatablePrefix: string,
                  valueField: string,
                  labelField: string,
              ) => object)
            | null; // null
        delimiter?: string; // ,
        disableHighlight?: boolean; // false
        disableSifter?: boolean; // false
        disabled?: boolean; // false
        disabledField?: string; // '$disabled'
        dndzone?: () => { noop: boolean; destroy: () => object }; // () => ({ noop: true, destroy: () => {}})
        dropdownItem?: ComponentType; // import('svelecte/components/Item.svelte')
        fetch?: string | null; // null
        fetchCallback?: ((jsonResponse: object) => object[]) | null; // null
        fetchMode?: string; // 'auto'
        fetchResetOnBlur?: true; // true
        groupItemsField?: string; // 'options'
        groupLabelField?: string; // 'label'
        hasAnchor?: boolean; // false
        highlightFirstItem?: boolean; // true
        i18n?: object | null; // null
        inputId?: string | null; // null
        keepCreated?: boolean; // true
        labelAsValue?: boolean; // false
        labelField?: string | null; // null
        lazyDropdown?: boolean; // true
        max?: number; // 0
        minQuery?: number; // 1
        multiple?: boolean; // false
        name?: string | null; // null
        options?: Item[]; // []
        //parentValue?: unknown; // undefined
        placeholder?: string; // 'Select'
        renderer?:
            | string
            | ((item: object | string, isSelected: bool, inputValue: string) => string)
            | null; // null
        required?: bool; // false
        resetOnBlur?: boolean; // true
        resetOnSelect?: select; // true
        searchField?: string | string[] | null; // null
        searchable?: boolean; // true
        selectOnTab?: boolean | 'select-navigate' | null; // null
        sortField?: string | null; // null
        style?: string; // null
        validatorAction?: object[] | null; // null
        valueAsObject?: boolean; // false
        valueField?: string | null; // null
        virtualList?: boolean; // false
        vlHeight?: number | null; // null
        vlItemSize?: number | null; // null
    }

    interface Svelecte_Events {
        fetch: CustomEvent<Item[]>;
        change: CustomEvent<Item | Item[] | null>;
        createoption: CustomEvent<Item>;
        blur: CustomEvent<undefined>;
        invalidValue: CustomEvent<unknown>;
        enterKey: CustomEvent<KeyboardEvent>;
    }

    interface Svelecte_Slots {
        icon: unknown;
        'control-end': unknown;
        'indicator-icon': {
            hasDropdownOpened: Writable<boolean>;
        };
        'clear-icon': {
            selectedOptions: Item[];
        };
    }

    export default class Svelecte extends SvelteComponent<
        Svelecte_Props,
        Svelecte_Events,
        Svelecte_Slots
    > {
        public focus: (event: FocusEvent) => void;
    }

    export const TAB_SELECT_NAVIGATE: 'select-navigate';
}
