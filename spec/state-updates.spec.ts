import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { ReflectiveInjector } from '@angular/core';
import { Action, provideStore, Dispatcher } from '@ngrx/store';

import { StateUpdates } from '../lib/state-updates';
import { STATE_UPDATES_PROVIDER} from '../lib/ng2'

describe('StateUpdates', function() {
  let stateUpdates$: StateUpdates<number>;
  let dispatcher: Dispatcher;
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
      provideStore(reducer),
      STATE_UPDATES_PROVIDER
    ]);

    stateUpdates$ = injector.get(StateUpdates);
    dispatcher = injector.get(Dispatcher);
  });

  it('should give you iterations of state change', function() {
    const actions = [
      { type: ADD,             state:  1 },
      { type: SUBTRACT,        state:  0 },
      { type: SUBTRACT,        state: -1 },
      { type: SUBTRACT,        state: -2 }
    ];

    let iterations = [
      { type: Dispatcher.INIT, state:  0 },
      ...actions
    ];

    stateUpdates$.subscribe({
      next(value) {
        let change = iterations.shift();
        expect(value.action.type).toEqual(change.type);
        expect(value.state).toEqual(change.state);
      }
    });

    actions.forEach(({ type }) => dispatcher.dispatch({ type }));
  });

  it('should let you filter out actions', function() {
    const actions = [ ADD, ADD, SUBTRACT, ADD, SUBTRACT ];
    const expected = actions.filter(type => type === ADD);

    stateUpdates$
      .whenAction(ADD)
      .map(update => update.action.type)
      .toArray()
      .subscribe({
        next(actual) {
          expect(actual).toEqual(expected);
        }
      });

    actions.forEach(action => dispatcher.dispatch({ type: action }));
    dispatcher.complete();
  });

  it('should not be an observer', function() {
    const observer = { next(){}, error(){}, complete(){} };

    spyOn(observer, 'next');
    spyOn(observer, 'error');
    spyOn(observer, 'complete');

    stateUpdates$.subscribe(observer);

    stateUpdates$.next(null);
    stateUpdates$.error(null);
    stateUpdates$.complete();

    // It will be called with the initial action 
    expect(observer.next).not.toHaveBeenCalledTimes(2);
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).not.toHaveBeenCalled();
  });
});