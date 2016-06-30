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

To help you compose new action sources, @ngrx/effects exports a `StateUpdates` observable service that emits every time your state updates along with the action that caused the state update. Note that even if there are no changes in your state, every action will cause state to update.

For example, here's an AuthEffects service that describes a source of login actions:
```ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action, Dispatcher } from '@ngrx/store';
import { Effect } from '@ngrx/effects'

@Injectable()
export class AuthEffects {
  constructor(private http: Http, private actions$: Dispatcher) { }

  @Effect() login$ = this.actions$
      // Listen for the 'LOGIN' action
      .ofType('LOGIN')
      // Map the payload into JSON to use as the request body
      .map(action => JSON.stringify(action.payload))
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

### Dynamically Running Effects

The `@Effect()` provides metadata to hint which observables on an effect class to connect `Store`. To dynamically run an effect inject the effect class and subscribe the effect to `Store` manually:

```ts
@Injectable()
export class AuthEffects {
  @Effect() login$ = this.actions$
    .ofType('LOGIN')
    .mergeMap(...)
}


@Component({
  providers: [
    AuthEffects
  ]
})
export class SomeComponent {
  subscription: Subscription;

  constructor(store: Store<State>, authEffects: AuthEffects) {
    this.subscription = authEffects.login$.subscribe(store);
  }
}
```

Unsubscribe the subscription to stop the effect:
```ts
ngOnDestroy() {
  this.subscription.unsubscribe();
}
```

#### Starting Groups of Effects
If you don't want to connect each source manually, you can use `mergeEffects()` to merge all decorated effects across any number of effect service instances:

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
To test your effects, mock out your effect's dependencies and use the `MockDispatcher` service to send actions to your effect:

```ts
import {
  MOCK_EFFECTS_PROVIDERS,
  MockDispatcher
} from '@ngrx/effects/testing';

describe('Auth Effects', function() {
  let auth: AuthEffects;
  let actions$: MockDispatcher;

  beforeEach(function() {
    const injector = ReflectiveInjector.resolveAndCreate([
      AuthEffects,
      MOCK_EFFECTS_PROVIDERS,
      // Mock out other dependencies (like Http) here
    ]);

    auth = injector.get(AuthEffects);
    actions$ = injector.get(MockDispatcher);
  });

  it('should respond in a certain way', function() {
    // Add an action in the updates queue
    actions$.dispatch({ type: 'LOGIN', payload: { ... } });

    auth.login$.subscribe(function(action) {
      /* assert here */
    });
  });
});
```

You can use `MockDispatcher@dispatch(action)` to send an action to your effect. Note that `MockDispatcher` is a replay subject with an infinite buffer size letting you queue up actions to send to your effect.


### Migrating from store-saga

@ngrx/effects is heavily inspired by store-saga making it easy to translate sagas into effects.

#### Rewriting Sagas
In store-saga, an `iterable$` observable containing state/action pairs along with the `filter` operator and the `whenAction` helper let you listen for specific actions to occur. In @ngrx/effects, you use the `Dispatcher` from `@ngrx/store` with the special `ofType` operator to filter for specific actions:

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
import { Dispatcher } from '@ngrx/store';
import { Effect } from '@ngrx/effects';

@Injectable()
export class AuthEffects {
  constructor(private http: Http, private actions$: Dispatcher) { }

  @Effect() login$ = this.actions$
    .ofType('LOGIN')
    .map(action => JSON.stringify(action.payload))
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
