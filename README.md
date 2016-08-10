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
In @ngrx/effects, effects are _sources of actions_. You use the `@Effect()` decorator to hint which observables on a service are action sources, and @ngrx/effects automatically merges your action streams letting you subscribe them to store.

To help you compose new action sources, @ngrx/effects exports an `Actions` observable service that emits every action dispatched in your application.


### Example
1. Create an AuthEffects service that describes a source of login actions:
  ```ts
  import { Injectable, OnDestroy } from '@angular/core';
  import { Observable } from 'rxjs/Observable';
  import { Subscription } from 'rxjs/Subscription';
  import { Action, Store } from '@ngrx/store';
  import { Actions, Effect, mergeEffects } from '@ngrx/effects';

  @Injectable()
  export class AuthEffects implements OnDestroy {
    subscription: Subscription;

    constructor(
      private http: Http,
      private actions$: Actions,
      private store: Store<State>
    ) {
      // Merge all effects and subscribe them to the store
      this.subscription = mergeEffects(this).subscribe(store);
    }

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

    // You MUST implement an ngOnDestroy method for your effects to
    // automatically start. Use ngOnDestroy to cleanup running effects.
    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
  }
  ```

2. Provide your service in your component's providers array or in an `NgModule` providers array to automatically start your effects:
  ```ts
  import { AuthEffects } from './effects/auth';

  @NgModule({
    providers: [ AuthEffects ]
  })
  export class AppModule { }
  ```




### Testing Effects
WIP
