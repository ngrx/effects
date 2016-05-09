import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/observable/of';
import { ReflectiveInjector } from '@angular/core';
import { Action, provideStore, Dispatcher } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import {
  Effect,
  getEffectKeys,
  mergeEffects,
  StateChanges,
  StateChange,
  STATE_CHANGES_PROVIDER
} from '../lib';


describe('@ngrx/effects', function() {
  describe('Effect Decorator', () => {

    it('should get the effect keys for a class instance', () => {
      class Fixture {
        @Effect() a;
        @Effect() b;
        @Effect() c;
      }

      const mock = new Fixture();

      expect(getEffectKeys(mock)).toEqual(['a', 'b', 'c']);
    });

    it('should return an empty array if the class has not been decorated', () => {
      class Fixture {
        a;
        b;
        c;
      }

      const mock = new Fixture();

      expect(getEffectKeys(mock)).toEqual([]);
    });
  });

  describe('mergeEffects', function() {
    it('should merge all observable sources decorated with @Effect()', function(done) {
      class Fixture {
        @Effect() a = Observable.of('a');
        @Effect() b = Observable.of('b');
        @Effect() c = Observable.of('c');
      }

      const mock = new Fixture();
      const expected = ['a', 'b', 'c'];

      mergeEffects(mock).toArray().subscribe({
        next(actual) {
          expect(actual).toEqual(expected);
        },
        error: done,
        complete: done
      });
    });
  });

  describe('StateChanges', function() {
    let stateChanges$: StateChanges;
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
        STATE_CHANGES_PROVIDER
      ]);

      stateChanges$ = injector.get(StateChanges);
      dispatcher = injector.get(Dispatcher);
    });

    it('should give you iterations of state change', function(done) {
      const actions = [
        {
          type: ADD,
          state: 1
        },
        {
          type: SUBTRACT,
          state: 0
        },
        {
          type: SUBTRACT,
          state: -1
        },
        {
          type: SUBTRACT,
          state: -2
        }
      ];

      let iterations = [
        {
          type: Dispatcher.INIT,
          state: 0
        },
        ...actions
      ];

      stateChanges$.take(iterations.length).subscribe({
        next(value) {
          let change = iterations.shift();
          expect(value.action.type).toEqual(change.type);
          expect(value.state).toEqual(change.state);
        },
        error: done,
        complete: done
      });

      actions.map(iteration => {
        dispatcher.dispatch({ type: iteration.type });
      });
    });
  });

});