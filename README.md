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
  import { Injectable } from '@angular/core';
  import { Http } from '@angular/http';
  import { Actions, Effect } from '@ngrx/effects';

  @Injectable()
  export class AuthEffects implements OnDestroy {
    constructor(
      private http: Http,
      private actions$: Actions
    ) { }

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

2. Provide your service via `EffectsModule.run` to automatically start your effect:
  ```ts
  import { AuthEffects } from './effects/auth';
  import { EffectsModule } from '@ngrx/effects';

  @NgModule({
    imports: [
      EffectsModule.run(AuthEffects)
    ]
  })
  export class AppModule { }
  ```
  *Note*: For effects that depend on the application to be bootstrapped (i.e. effects that depend on the Router) use `EffectsModule.runAfterBootstrap`. Be aware that `runAfterBootstrap` will only work in the root module.



### Testing Effects
WIP
