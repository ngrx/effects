import { OpaqueToken, Provider } from '@angular/core';

import { flatten } from './util';
import { CONNECT_EFFECTS_PROVIDER } from './effects';
import { STATE_UPDATES_PROVIDER } from './state-updates';

export const BOOTSTRAP_EFFECTS = new OpaqueToken('@ngrx/effects Bootstrap Effects');

export function runEffects(...effects: any[]) {
  const allEffects = flatten(effects).map(effect => new Provider(BOOTSTRAP_EFFECTS, {
    useClass: effect,
    multi: true
  }));

  return [
    ...allEffects,
    CONNECT_EFFECTS_PROVIDER,
    STATE_UPDATES_PROVIDER
  ];
}