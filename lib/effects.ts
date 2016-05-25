import 'rxjs/add/observable/merge';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { OpaqueToken, APP_INITIALIZER, Provider } from '@angular/core';

import { getEffectKeys } from './metadata';
import { flatten } from './util';

export const BOOTSTRAP_EFFECTS = new OpaqueToken('@ngrx/effects Bootstrap Effects');

export function mergeEffects(...instances: any[]): Observable<any> {
  const observables = flatten(instances).map(i => getEffectKeys(i).map(key => i[key]));

  return Observable.merge(...flatten(observables));
}


export function connectEffectsToStore(store: Store<any>, effects: any[]) {
  return function() {
    mergeEffects(...effects).subscribe(store);

    return Promise.resolve(true);
  };
}


export const CONNECT_EFFECTS_PROVIDER = new Provider(APP_INITIALIZER, {
  multi: true,
  deps: [ Store, BOOTSTRAP_EFFECTS ],
  useFactory: connectEffectsToStore
});
