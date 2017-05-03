import { OpaqueToken, Inject, SkipSelf, Optional, Injectable, OnDestroy } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import { merge } from 'rxjs/observable/merge';
import { mergeEffects } from './effects';
import { SingletonEffectsService } from './singleton-effects.service';


export const effects = new OpaqueToken('ngrx/effects: Effects');

@Injectable()
export class EffectsSubscription extends Subscription implements OnDestroy {
  constructor(
    @Inject(Store) private store: Observer<Action>,
    @Optional() @SkipSelf() public parent: EffectsSubscription,
    @Optional() @Inject(effects) effectInstances?: any[],
    @Optional() @Inject(SingletonEffectsService) singletonEffectsService?: SingletonEffectsService
  ) {
    super();

    if (Boolean(parent)) {
      parent.add(this);
    }

    if (Boolean(effectInstances)) {
      this.addEffects(effectInstances, singletonEffectsService);
    }
  }

  addEffects(effectInstances: any[], singletonEffectsService?: SingletonEffectsService) {
    if (singletonEffectsService) {
      effectInstances = singletonEffectsService.removeExistingAndRegisterNew(effectInstances);
    }
    const sources = effectInstances.map(mergeEffects);
    const merged = merge(...sources);

    this.add(merged.subscribe(this.store));
  }

  ngOnDestroy() {
    if (!this.closed) {
      this.unsubscribe();
    }
  }
}
