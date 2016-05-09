/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts"/>
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/observeOn';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/cache';
import { Action, Dispatcher, State } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { OpaqueToken, APP_INITIALIZER, provide, Provider } from '@angular/core';

const METADATA_KEY = '@ngrx/effects';

export function Effect(): PropertyDecorator {
  return function(target: any, propertyName: string) {
    if (!Reflect.hasOwnMetadata(METADATA_KEY, target)) {
      Reflect.defineMetadata(METADATA_KEY, [], target);
    }

    const effects = Reflect.getOwnMetadata(METADATA_KEY, target);

    Reflect.defineMetadata(METADATA_KEY, [ ...effects, propertyName ], target);
  };
}

export function getEffectKeys(instance: any): string[] {
  const target = Object.getPrototypeOf(instance);

  if (!Reflect.hasOwnMetadata(METADATA_KEY, target)) {
    return [];
  }

  return Reflect.getOwnMetadata(METADATA_KEY, target);
}

export function flatten(list: any[]): any[] {
  return list.reduce((items: any[], next) => {
    if (Array.isArray(next)) {
      return items.concat(flatten(next));
    }

    return items.concat(next);
  }, []);
}

export function mergeEffects(...instances: any[]): Observable<any> {
  const observables = instances.map(i => getEffectKeys(i).map(key => i[key]));

  return Observable.merge(...flatten(observables));
}

export interface StateChange {
  state: any;
  action: Action;
}

export class StateChanges extends Observable<StateChange> { }

export const BOOTSTRAP_EFFECTS = new OpaqueToken('@ngrx/effects Bootstrap Effects');


export function connectEffectsToDispatcher(dispatcher: Dispatcher, effects: any[]) {
  return function() {
    mergeEffects(...effects).subscribe(dispatcher);

    return Promise.resolve(true);
  }
}

export const STATE_CHANGES_PROVIDER = provide(StateChanges, {
  deps: [ Dispatcher, State ],
  useFactory(actions$: Dispatcher, state$: State<any>) {
    return actions$
      .withLatestFrom(state$)
      .map<StateChange>(([ action, state ]) => ({ state, action }))
      .cache();
  }
});


export const CONNECT_EFFECTS_PROVIDER = provide(APP_INITIALIZER, {
  multi: true,
  deps: [ Dispatcher, BOOTSTRAP_EFFECTS ],
  useFactory: connectEffectsToDispatcher
});

export function runEffects(...effects: any[]) {
  const allEffects = flatten(effects).map(effect => provide(BOOTSTRAP_EFFECTS, {
    useClass: effect,
    multi: true
  }));

  return [
    ...allEffects,
    CONNECT_EFFECTS_PROVIDER,
    STATE_CHANGES_PROVIDER
  ];
}