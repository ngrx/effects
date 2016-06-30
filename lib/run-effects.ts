import { OpaqueToken } from '@angular/core';

import { flatten } from './util';
import { CONNECT_EFFECTS_PROVIDER, BOOTSTRAP_EFFECTS } from './effects';



export function runEffects(...effects: any[]): any[] {
  const effectsBoundToBootstrap = flatten(effects)
    .map(effect => ({
      provide: BOOTSTRAP_EFFECTS,
      useExisting: effect,
      multi: true
    }));

  return [
    effects,
    effectsBoundToBootstrap,
    CONNECT_EFFECTS_PROVIDER
  ];
}
