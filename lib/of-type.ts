import { Dispatcher, Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operator/filter';

export interface OfTypeSignature {
  (...actionTypes: string[]): Observable<Action>;
}

export const ofType: OfTypeSignature = function(...actionTypes: string[]): Observable<Action> {
  return filter.call(this,
    (action: Action) => actionTypes.indexOf(action.type) > -1
  );
}

Dispatcher.prototype.ofType = ofType;

declare module '@ngrx/store/dispatcher' {
  export interface Dispatcher {
    ofType: OfTypeSignature;
  }
}
