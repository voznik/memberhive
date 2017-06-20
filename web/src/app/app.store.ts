import {
    ActionReducerMap,
    createSelector,
    combineReducers,
    compose
} from '@ngrx/store';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';

import * as interaction from 'mh-core';
import * as person from 'mh-core';
import * as settings from 'mh-core';
import * as auth from 'mh-core';

export interface AppState {
    interaction: interaction.InteractionState;
    person: person.PersonState;
    settings: settings.SettingsState;
    auth: auth.AuthState;
    router: RouterReducerState;
}

export const reducers: ActionReducerMap<AppState> = {
    interaction: interaction.interactionReducer,
    person: person.personReducer,
    settings: settings.settingsReducer,
    auth: auth.authReducer,
    router: routerReducer
};

/**
 * People Reducers
 */
export const getPersonState: any = (state: AppState) => state.person;
export const getPeople: any = createSelector(getPersonState, person.getPeople);
export const getSelectedPerson: any = createSelector(getPersonState, person.getPerson);
/**
 * Settings Reducers
 */
export const getSettingsState: any = (state: AppState) => state.settings;
export const getLayoutSettings: any = createSelector(getSettingsState, settings.getLayoutSettings);
export const getPeopleSettings: any = createSelector(getSettingsState, settings.getPeopleSettings);
export const getPeopleListSettings: any = createSelector(getSettingsState, settings.getPeopleListSettings);
export const getProfileSettings: any = createSelector(getSettingsState, settings.getProfileSettings);
export const getSysSettings: any = createSelector(getSettingsState, settings.getSysSettings);

export const getShowDrawer: any = createSelector(getSettingsState, settings.getShowDrawer);
export const getContextButtons: any = createSelector(getSettingsState, settings.getContextButtons);
/**
 * Loading  Reducers
 */
export const getLoadingP: any = createSelector(getPersonState, person.getLoadingPerson);
export const getLoadingS: any = createSelector(getSettingsState, settings.getLoadingSettings);
export const getLoading: any = createSelector(getLoadingP, getLoadingS,
    (loadingP: boolean, loadingS: boolean) => loadingP || loadingS);
/**
 * Message  Reducers
 */
export const getMessageP: any = createSelector(getPersonState, person.getMessagePerson);
export const getMessageS: any = createSelector(getSettingsState, settings.getMessageSettings);
export const getMessage: any = createSelector(getMessageP, getMessageS,
    (msgP: any, msgS: any) => msgP || msgS);
// TODO: make this work (below)
/*export const getMessage: any = (state: AppState) => [getMessageP, getMessageS]
        .find(messageSelector => messageSelector(state));*/
/**
 * Auth Reducers
 */
export const getAuthState: any = (state: AppState) => state.auth;
export const isAuthenticated: any = createSelector(getAuthState, auth.isAuthenticated);
export const isAuthLoading: any = createSelector(getAuthState, auth.isAuthenticationLoading);
export const getAuthError: any = createSelector(getAuthState, auth.getAuthenticationError);
export const isAuthLoaded: any = createSelector(getAuthState, auth.isAuthenticatedLoaded);
export const getAuthPersonId: any = createSelector(getAuthState, auth.getPersonId);
export const getAuthPerson: any = createSelector(getPeople, getAuthPersonId,
    (people: person.Person[], personId: string) => {
    return people.filter((person: person.Person) => person.uid === personId)[0];
});
/**
 * Router Reducers
 */
export const getRouterState: any = (state: AppState) => state.router;
export const getRouterPath: any = createSelector(getRouterState, (reducerState: RouterReducerState) => {
    return reducerState.state.url;
});
