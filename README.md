# @ngrx/effects
### Side effect model for @ngrx/store
[![Join the chat at https://gitter.im/ngrx/store](https://badges.gitter.im/ngrx/store.svg)](https://gitter.im/ngrx/store?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

### Installation
To install @ngrx/effects from npm:
```bash
npm install @ngrx/effects --save
```
### Example Application

https://github.com/ngrx/example-app

## Effects
In @ngrx/effects, effects are _sources of actions_. You use the `@Effect()` decorator to hint which observables on a service are action sources, and @ngrx/effects automatically connects your action sources to your store

To help you compose new action sources, @ngrx/effects exports a `StateUpdates` observable service that emits a `StateUpdate` object, containing the current state and dispatched action, for each state update.

__*Note: Even if there are no changes in your state, every action will cause state to update!*__


### Example
1. Create an AuthEffects service that describes a source of login actions:
  ```ts
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs/Observable';
  import { Action } from '@ngrx/store';
  import { StateUpdates, Effect } from '@ngrx/effects'

  @Injectable()
  export class AuthEffects {
    constructor(private http: Http, private updates$: StateUpdates<any>) { }

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

2. Run your effects during application bootstrap:
  ```ts
import { runEffects } from '@ngrx/effects';

bootstrap(App, [
  provideStore(reducer),
  runEffects(AuthEffects)
]);
```

### Dynamically Running Effects

The `@Effect()` decorator provides metadata to hint which observables on a class should be connected to `Store`. If you want to dynamically run an effect inject the effect class and subscribe the effect to `Store` manually:

```ts
@Injectable()
export class AuthEffects {
  @Effect() login$ = this.updates$
    .whenAction('LOGIN')
    .mergeMap(...)
}


@Component({
  providers: [
    AuthEffects
  ]
})
export class SomeCmp {
  subscription: Subscription;

  constructor(store: Store<State>, authEffects: AuthEffects) {
    this.subscription = authEffects.login$.subscribe(store);
  }
}
```

Unsubscribe to stop the effect:
```ts
ngOnDestroy() {
  this.subscription.unsubscribe();
}
```

#### Starting Multiple Effects
If you don't want to connect each source manually, you can use the `mergeEffects()` helper function to automatically merge all decorated effects across any number of effect services:

```ts
import { OpaqueToken, Inject } from '@angular/core';
import { mergeEffects } from '@ngrx/effects';

const EFFECTS = new OpaqueToken('Effects');

@Component({
  providers: [
    provide(EFFECTS, { multi: true, useClass: AuthEffects }),
    provide(EFFECTS, { multi: true, useClass: AccountEffects }),
    provide(EFFECTS, { multi: true, useClass: UserEffects })
  ]
})
export class SomeCmp {
  constructor(@Inject(EFFECTS) effects: any[], store: Store<State>) {
    mergeEffects(effects).subscribe(store);
  }
}
```


### Testing Effects
To test your effects mock out your effect's dependencies and use the `MockStateUpdates` service to send actions and state changes to your effect:

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


### Migrating from store-saga

@ngrx/effects is heavily inspired by store-saga making it easy to translate sagas into effects.

#### Rewriting Sagas
In store-saga, an `iterable$` observable containing state/action pairs was provided to your saga factory function. Typically you would use the `filter` operator and the `whenAction` helper to listen for specific actions to occur. In @ngrx/effects, an observable named `StateUpdates` offers similar functionality and can be injected into an effect class. To listen to specific actions, @ngrx/effects includes a special `whenAction` operator on the `StateUpdates` observable.

Before:
```ts
// ... other needed imports here ...
import { createSaga, whenAction, toPayload } from 'store-saga';

const login$ = createSaga(function(http: Http) {

  return iterable$ => iterable$
    .filter(whenAction('LOGIN'))
    .map(iteration => JSON.stringify(iteration.action.payload))
    .mergeMap(body => http.post('/auth', body)
      .map(res => ({
        type: 'LOGIN_SUCCESS',
        payload: res.json()
      }))
      .catch(err => Observable.of({
        type: 'LOGIN_ERROR',
        payload: err.json()
      }))
    );

}, [ Http ]);
```

After:
```ts
// ... other needed imports here ...
import { Effect, toPayload, StateUpdates } from '@ngrx/effects';

@Injectable()
export class AuthEffects {
  constructor(private http: Http, private updates$: StateUpdates<State>) { }

  @Effect() login$ = this.updates$
    .whenAction('LOGIN')
    .map(update => JSON.stringify(update.action.payload))
    .mergeMap(body => this.http.post('/auth', body)
      .map(res => ({
        type: 'LOGIN_SUCCESS',
        payload: res.json()
      }))
      .catch(err => Observable.of({
        type: 'LOGIN_ERROR',
        payload: err.json()
      }))
    );
}
```
