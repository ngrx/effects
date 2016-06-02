import { OpaqueToken, Provider } from '@angular/core';

import { flatten } from './util';
import { CONNECT_EFFECTS_PROVIDER, BOOTSTRAP_EFFECTS } from './effects';
import { STATE_UPDATES_PROVIDER } from './state-updates';


export function runEffects(...effects: any[]) {
  const individuals = flatten(effects);

  const allEffects = individuals
    .map(effectClass => new Provider(BOOTSTRAP_EFFECTS, {
      useExisting: effectClass,
      multi: true
    }));

  return [
    ...individuals,
    ...allEffects,
    CONNECT_EFFECTS_PROVIDER,
    STATE_UPDATES_PROVIDER
  ];
}