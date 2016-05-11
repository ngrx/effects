import { withLatestFrom } from 'rxjs/operator/withLatestFrom';
import { map } from 'rxjs/operator/map';
import { filter } from 'rxjs/operator/filter';
import { Action, Dispatcher, State } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Injectable, Provider } from '@angular/core';


export interface StateUpdate {
  state: any;
  action: Action;
}

@Injectable()
export class StateUpdates extends ReplaySubject<StateUpdate> {
  constructor(actions$: Dispatcher, state$: State<any>) {
    super(1);

    withLatestFrom
      .call(actions$, state$)
      .subscribe(([ action, state ]) => {
        super.next({ action, state });
      });
  }

  next(update: StateUpdate) { /* noop */ }
  error(err: any) { /* noop */ }
  complete() { /* noop */ }

  whenAction(actionType: string): Observable<StateUpdate> {
    return filter.call(this, ({ action }: StateUpdate) => action.type === actionType);
  }
}

export const STATE_UPDATES_PROVIDER = new Provider(StateUpdates, {
  useClass: StateUpdates
});