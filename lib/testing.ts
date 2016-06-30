import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Action, Dispatcher } from '@ngrx/store';
import { OfTypeSignature, ofType } from './of-type';

export class MockDispatcher extends ReplaySubject<Action> {
  constructor() {
    super();
  }

  dispatch(action: Action) {
    this.next(action);
  }

  ofType: OfTypeSignature = ofType.bind(this);
}

export const MOCK_EFFECTS_PROVIDERS: any[] = [
  {
    provide: MockDispatcher,
    useClass: MockDispatcher
  },
  {
    provide: Dispatcher,
    useExisting: MockDispatcher
  }
];
