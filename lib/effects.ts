import 'rxjs/add/observable/merge';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { getEffectKeys } from './metadata';
import { flatten } from './util';

export function mergeEffects(...instances: any[]): Observable<any> {
  const observables: Observable<any>[] = flatten(instances).map((i: any): any => getEffectKeys(i).map(
    (key: string): Observable<any> => {
        if (typeof i[key] === 'function') {
            return i[key]();
        }
        return i[key];
    }
  ));

  return Observable.merge(...flatten(observables));
}

export function connectEffectsToStore(store: Store<any>, effects: any[]) {
  return function() {
    mergeEffects(...effects).subscribe(store);

    return Promise.resolve(true);
  };
}
