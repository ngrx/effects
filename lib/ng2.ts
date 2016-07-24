import {APP_INITIALIZER} from '@angular/core';

import {flatten} from './util';
import {connectEffectsToStore} from './effects';
import {StateUpdates} from './state-updates';
import {Store, Dispatcher} from "@ngrx/store";

export const BOOTSTRAP_EFFECTS = new String('@ngrx/effects Bootstrap Effects');

export function runEffects(...effects: any[]) {
    const individuals = flatten(effects);

    const allEffects = individuals.map(effectClass => createDynamicProvider(effectClass));
    return [
        ...individuals,
        ...allEffects,
        CONNECT_EFFECTS_PROVIDER,
        STATE_UPDATES_PROVIDER
    ];
}

export const CONNECT_EFFECTS_PROVIDER = {
    provide: APP_INITIALIZER,
    multi: true,
    deps: [Store, BOOTSTRAP_EFFECTS],
    useFactory: connectEffectsToStore
};

export const STATE_UPDATES_PROVIDER = {
    provide: StateUpdates,
    deps: [Dispatcher, Store],
    useFactory(dispatcher: Dispatcher, store: Store<any>) {
        return new StateUpdates(dispatcher, store);
    }
};

function createDynamicProvider(effectClass: any) {
    return {
        provide: BOOTSTRAP_EFFECTS,
        useExisting: effectClass,
        multi: true
    }
}