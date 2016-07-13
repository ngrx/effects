import 'rxjs/add/observable/merge';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { getEffectKeys } from './metadata';
import { flatten } from './util';

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
