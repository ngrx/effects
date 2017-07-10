// TODO: This is a copy of this: https://github.com/redux-observable/redux-observable/blob/master/src/ActionsObservable.js
// Remove after this is resolved: https://github.com/redux-observable/redux-observable/issues/95
import { Injectable, Inject } from '@angular/core';
import { Action, Dispatcher } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { filter } from 'rxjs/operator/filter';


@Injectable()
export class Actions extends Observable<Action> {
  constructor(@Inject(Dispatcher) actionsSubject: Observable<Action>) {
    super();
    this.source = actionsSubject;
  }

  ofType(...keys: string[]): Actions {
    return filter.call(this, ({ type }: {type: string}) => {
      const len = keys.length;
      if (len === 1) {
        return type === keys[0];
      } else {
        for (let i = 0; i < len; i++) {
          if (keys[i] === type) {
            return true;
          }
        }
      }
      return false;
    });
  }

  groupOfType(...keys: string[]): Actions {
    const len = keys.length;
    let completedActions: { [key: string]: boolean } = null;

    return filter.call(this, ({ type }: { type: string }) => {
      if (len > 1 && !completedActions) {
        completedActions = keys.reduce((obj: { [key: string]: boolean }, key: string) => {
          obj[key] = false;
          return obj;
        }, {});
      }

      if (len === 1) {
        return type === keys[0];
      } else if (!completedActions[type] && keys.indexOf(type) > -1) {
        completedActions[type] = true;
        const isAllCompleted = Object.keys(completedActions).every(key => completedActions[key]);

        if (isAllCompleted) {
          completedActions = null;
        }

        return isAllCompleted;
      }

      return false;
    });
  }
}
