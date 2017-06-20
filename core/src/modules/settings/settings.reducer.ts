import * as actions from './settings.actions';
import { ContextButton } from './settings.model';
import * as common from '../../common/common.model';

export interface SettingsState {
    loaded?: boolean;
    loading?: boolean;
    message?: common.Message;
    layout?: {
        showDrawer?: boolean,
        contextButtons?: ContextButton[]
    };
    people?: {
        list?: Array<string>,
        maritalStatus?: Array<any>
    };
    profile?: any;
    system?: any;
    dashboard?: any;
}

const initialState: SettingsState = {
    loaded: false,
    loading: false,
    layout: {
        showDrawer: true
    },
    people: {
        list: ['email'],
        maritalStatus: ['single', 'engaged', 'married', 'widowed', 'separated', 'divorced']
    },
    profile: {},
    system: {},
    dashboard: {}
};

export function settingsReducer(state: SettingsState = initialState,
                                action: actions.SettingActions): SettingsState {
    switch (action.type) {
        case actions.LIST_SETTINGS:
        case actions.UPDATE_SETTINGS: {
            return Object.assign({}, state, {
                loading: true
            });
        }

        case actions.CLEAR_SETTINGS_MESSAGE:
            return Object.assign({}, state, {
                message: undefined
            });

        case actions.LIST_SETTINGS_SUCCESS: {
            const settings: SettingsState = action.payload;
            settings.loading = false;
            settings.loaded = true;
            return Object.assign({}, state, settings);
        }

        case actions.UPDATE_SETTINGS_SUCCESS: {
            const settings: SettingsState = action.payload;
            const message: common.Message = {
                type: common.MESSAGE_SUCCESS,
                text: 'Successfully updated settings'
            };
            settings.message = message;
            settings.loading = false;
            settings.loaded = true;
            return Object.assign({}, state, settings);
        }

        case actions.TOGGLE_DRAWER: {
            return Object.assign({}, state, {
                layout: {
                    showDrawer: action.payload,
                    contextButtons: state.layout.contextButtons
                }
            });
        }

        case actions.SET_CONTEXT_BUTTONS: {
            return Object.assign({}, state, {
                layout: {
                    showDrawer: state.layout.showDrawer,
                    contextButtons: action.payload
                }
            });
        }

        default:
            return state;
    }
}

export const getLoadedSettings: any = (state: SettingsState) => state.loaded;
export const getLoadingSettings: any = (state: SettingsState) => state.loading;
export const getMessageSettings: any = (state: SettingsState) => state.message;

export const getLayoutSettings: any = (state: SettingsState) => state.layout;
export const getPeopleSettings: any = (state: SettingsState) => state.people;
export const getSysSettings: any = (state: SettingsState) => state.system;
export const getPeopleListSettings: any = (state: SettingsState) => state.people.list;
export const getProfileSettings: any = (state: SettingsState) => state.profile;

export const getShowDrawer: any = (state: SettingsState) => state.layout.showDrawer;
export const getContextButtons: any = (state: SettingsState) => state.layout.contextButtons;
