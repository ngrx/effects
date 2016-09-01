import { OpaqueToken, Inject, Optional, Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { merge } from 'rxjs/observable/merge';
import { mergeEffects } from './effects';
import { Actions } from './actions';


export const effects = new OpaqueToken('ngrx/effects: Effects');

@Injectable()
export class EffectsSubscription extends Subscription implements OnDestroy {
  constructor(
    private store: Store<any>,
    @Optional() @Inject(effects) effectInstances?: any[]
  ) {
    super();

    if (effectInstances) {
      this.addEffects(effectInstances);
    }
  }

  addEffects(effectInstances) {
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
