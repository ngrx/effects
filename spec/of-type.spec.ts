import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { ReflectiveInjector } from '@angular/core';
import { Action, provideStore, Dispatcher } from '@ngrx/store';

import '../lib/of-type';


describe('ofType Operator', function() {
  let actions$: Dispatcher;
  const ADD = 'ADD';
  const SUBTRACT = 'SUBTRACT';
  function reducer(state: number = 0, action: Action) {
    switch (action.type) {
      case ADD:
        return state + 1;
      case SUBTRACT:
        return state - 1;
      default:
        return state;
    }
  }

  beforeEach(function() {
    const injector = ReflectiveInjector.resolveAndCreate([
      provideStore(reducer)
    ]);

    actions$ = injector.get(Dispatcher);
  });

  it('should let you filter out actions', function() {
    const actions = [ ADD, ADD, SUBTRACT, ADD, SUBTRACT ];
    const expected = actions.filter(type => type === ADD);

    actions$
      .ofType(ADD)
      .map(action => action.type)
      .take(3)
      .toArray()
      .subscribe({
        next(actual) {
          expect(actual).toEqual(expected);
        }
      });

    actions.forEach(action => actions$.dispatch({ type: action }));
  });
});
