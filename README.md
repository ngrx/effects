# @ngrx/effects
### Side effect model for @ngrx/store
[![Join the chat at https://gitter.im/ngrx/store](https://badges.gitter.im/ngrx/store.svg)](https://gitter.im/ngrx/store?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


## Effects
In @ngrx/effects, effects are simply _sources of actions_. You use the `@Effect()` decorator to hint which observables on a service are action sources, and @ngrx/effects automatically connects your action sources to your store

To help you compose new action sources, @ngrx/effects exports a `StateUpdates` observable service that emits every time your state updates along with the action that caused the state update. Note that even if there are no changes in your state, every action will cause state to update.

For example, here's an AuthEffects service that describes a source of login actions:
```ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { StateUpdates, Effect } from '@ngrx/effects'

@Injectable()
export class AuthEffects {
  constructor(private http: Http, private updates$: StateUpdates) { }

  @Effect() login$ = this.updates$
      // Listen for the 'LOGIN' action
      .whenAction('LOGIN')
      // Map the payload into JSON to use as the request body
      .map(update => JSON.stringify(update.action.payload))
      .switchMap(payload => this.http.post('/auth', payload)
        // If successful, dispatch success action with result
        .map(res => ({ type: 'LOGIN_SUCCESS', payload: res.json() }))
        // If request fails, dispatch failed action
        .catch(() => Observable.of({ type: 'LOGIN_FAILED' }));
      );
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

### Testing Effects
To test your effects, simply mock out your effect's dependencies and use the `MockStateUpdates` service to send actions and state changes to your effect:

```ts
import {
  MOCK_EFFECTS_PROVIDERS,
  MockStateUpdates
} from '@ngrx/effects/testing';

describe('Auth Effects', function() {
  let auth: AuthEffects;
  let updates$: MockStateUpdates;

  beforeEach(function() {
    const injector = ReflectiveInjector.resolveAndCreate([
      AuthEffects,
      MOCK_EFFECTS_PROVIDERS,
      // Mock out other dependencies (like Http) here
    ]);

    auth = injector.get(AuthEffects);
    updates$ = injector.get(MockStateUpdates);
  });

  it('should respond in a certain way', function() {
    // Add an action in the updates queue
    updates$.sendAction({ type: 'LOGIN', payload: { ... } });

    auth.login$.subscribe(function(action) {
      /* assert here */
    });
  });
});
```

You can use `MockStateUpdates@sendAction(action)` to send an action with an empty state, `MockStateUpdates@sendState(state)` to send a state change with an empty action, and `MockStateUpdates@send(state, action)` to send both a state change and an action. Note that `MockStateUpdates` is a replay subject with an infinite buffer size letting you queue up multiple actions / state changes to be sent to your effect.
