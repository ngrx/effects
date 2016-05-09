# @ngrx/effects
### Side effect model for @ngrx/store
[![Join the chat at https://gitter.im/ngrx/store](https://badges.gitter.im/ngrx/store.svg)](https://gitter.im/ngrx/store?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


## Effects
In @ngrx/effects, effects are simply _sources of actions_. You use the `@Effect()` decorator to hint which observables on a service are action sources, and @ngrx/effects automatically connects your action sources to your store

To help you compose new action sources, @ngrx/effects exports a StateChanges observable service that emits every time your state changes along with the action that caused the state change.

For example, here's an AuthEffects service that describes a source of login actions:
```ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { StateChanges, Effect } from '@ngrx/effects'

@Injectable()
export class AuthEffects {
  @Effect() login$: Observable<Action>;

  constructor(http: Http, changes$: StateChanges) {
    this.login$ = changes$
      // Listen for the 'LOGIN' action to occur
      .filter(change => change.action.type === 'LOGIN')
      // Map the payload into JSON to use as the request body
      .map(change => JSON.stringify(change.action.payload))
      .switchMap(payload => http.post('/auth', payload)
        // If successful, dispatch success action with result
        .map(res => ({ type: 'LOGIN_SUCCESS', payload: res.json() }))
        // If request fails, dispatch failed action
        .catch(() => Observable.of({ type: 'LOGIN_FAILED' }));
      );
  }
}
```

Then you run your effects during bootstrap:
```ts
import { runEffects } from '@ngrx/effects';

bootstrap(App, [
  provideStore(reducer),
  runEffects(AuthEffects)
]);
```
