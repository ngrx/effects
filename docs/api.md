# @ngrx/effects API



## EffectsModule

Feature module for @ngrx/effects.

### forRoot
Used to provide optional config for Effects.

Usage:
```ts
@NgModule({
  imports: [
    EffectsModule.forRoot({ effectsAsSingletons: true })
  ]
})
export class AppModule { }
```

Using `effectsAsSingletons: true` will cause effects that are passed to
`EffectModule.run` multiple times (for example in lazy loaded modules) to only
subscribe once. This is useful if you have effects which are shared amongst
several lazy loaded features in your application and do not want effects to run
more than one - e.g. to prevent duplicate http requests being made.

### run

Registers an effects class to be run immediately when the target module is
created. Must be called multiple times for each effect class you want to run.

Usage:
```ts
@NgModule({
  imports: [
    EffectsModule.run(SomeEffectsClass)
  ]
})
export class AppModule { }
```

### runAfterBootstrap

Registers an effects class to be run after root components are bootstrapped.
Only works in the root module. Useful if your effects class requires components
to be bootstrapped.

If you are using a version of Angular older than 2.1, `runAfterBootstrap` is
necessary for effects that inject services from `@angular/router`.

Usage:
```ts
@NgModule({
  imports: [
    EffectsModule.runAfterBootstrap(SomeEffectsClass)
  ]
})
```


## Actions

Stream of all actions dispatched in your application including actions
dispatched by effect streams.

### ofType

Filter actions by action type. Accepts multiple action types.

Usage:
```
actions$.ofType('LOGIN', 'LOGOUT');
```


## Effect

Decorator that marks a class property or method as an effect. Causes the
decorated observable to be subscribed to `Store` when the effect class is
ran.

Usage:
```ts
class MyEffects {
  constructor(private actions$: Actions, private auth: AuthService) { }

  @Effect() login$: Observable<Action> = this.actions$
    .ofType('LOGIN')
    .switchMap(action =>
      this.auth.login(action.payload)
        .map(res => ({ type: 'LOGIN_SUCCESS', payload: res }))
        .catch(err => Observable.of({ type: 'LOGIN_FAILURE', payload: err }))
    );

  @Effect() logout(): Observable<Action> {
    return this.actions$
      .ofType('LOGOUT')
      .switchMap(() =>
        this.auth.logout()
          .map(res => ({ type: 'LOGOUT_SUCCESS', payload: res }))
          .catch(err => Observable.of({ type: 'LOGOUT_FAILURE', payload: err }))
      );
  }
}
```

Observables decorated with the `@Effect()` decorator are expected to be a stream
of actions to be dispatched. Pass `{ dispatch: false }` to the decorator to
prevent actions from being dispatched.

Usage:
```ts
class MyEffects {
  constructor(private actions$: Actions) { }

  @Effect({ dispatch: false }) logActions$ = this.actions$
    .do(action => {
      console.log(action);
    });
}
```

## Utilities

### toPayload
Maps an action to its payload.

Usage:
```ts
actions$.ofType('LOGIN').map(toPayload);
```

### mergeEffects
Manually merges all decorated effects into a combined observable.

Usage:
```ts
export class MyService {
  constructor(effects: SomeEffectsClass) {
    mergeEffects(effects).subscribe(result => {

    });
  }
}
```

## EffectsSubscription

An rxjs subscription of all effects running for the current injector. Can be
used to stop all running effects contained in the subscription.

Usage:
```ts
class MyComponent {
  constructor(private subscription: EffectsSubscription) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

### addEffects
Add additional instances of effect classes to the subscription.

Usage:
```ts
class MyComponent {
  constructor(moreEffects: MoreEffects, subscription: EffectsSubscription) {
    subscription.addEffects([ moreEffects ]);
  }
}
```

### parent
A pointer to the parent subscription. Used to access an entire tree of
subscriptions.

Usage:
```ts
subscription.parent.unsubscribe();
```
