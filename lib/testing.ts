import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Action } from '@ngrx/store';
import { Provider } from '@angular/core';
import { filter } from 'rxjs/operator/filter';
import { Observable } from 'rxjs/Observable';
import { StateUpdate, StateUpdates } from './state-updates';

export class MockStateUpdates extends ReplaySubject<StateUpdate<any>> {
  constructor() {
    super();
  }

  send(state: any, action: Action) {
    this.next({ state, action });
  }

  sendAction(action: Action) {
    this.next({ state: null, action });
  }

  sendState(state: any) {
    this.next({ state, action: null });
  }

  whenAction(...actionTypes: string[]): Observable<StateUpdate<any>> {
    return filter.call(this,
      ({ action }: StateUpdate<any>) => actionTypes.indexOf(action.type) > -1
    );
  }
}

export const MOCK_EFFECTS_PROVIDERS = [
  new Provider(MockStateUpdates, {
    useClass: MockStateUpdates
  }),
  new Provider(StateUpdates, {
    useExisting: MockStateUpdates
  })
];
