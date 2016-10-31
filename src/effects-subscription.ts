import { OpaqueToken, Inject, SkipSelf, Optional, Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import { merge } from 'rxjs/observable/merge';
import { mergeEffects } from './effects';
import { Actions } from './actions';

import { effectsConfig, EffectsConfiguration } from './effects.config';

export const effects = new OpaqueToken('ngrx/effects: Effects');

@Injectable()
export class EffectsSubscription extends Subscription implements OnDestroy {
  constructor(
    @Inject(Store) private store: Observer<Actions>,
    @Optional() @SkipSelf() public parent: EffectsSubscription,
    @Optional() @Inject(effects) effectInstances?: any[],
    @Optional() @Inject(effectsConfig) private effectsConfig?: EffectsConfiguration,
  ) {
    super();

    if (Boolean(parent)) {
      parent.add(this);
    }

    if (Boolean(effectInstances)) {
      this.addEffects(effectInstances);
    }
  }

  addEffects(effectInstances: any[]) {
    const registerEffectWithPrefix = this.effectsConfig && this.effectsConfig.registerEffectWithPrefix;
    const sources = effectInstances.map(instance => mergeEffects(instance, registerEffectWithPrefix));
    const merged = merge(...sources);

    this.add(merged.subscribe(this.store));
  }

  ngOnDestroy() {
    if (!this.closed) {
      this.unsubscribe();
    }
  }
}
