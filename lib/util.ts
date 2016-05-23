import { Action } from '@ngrx/store';
import { StateUpdate } from './state-updates';


export function flatten(list: any[]): any[] {
  return list.reduce((items: any[], next) => {
    if (Array.isArray(next)) {
      return items.concat(flatten(next));
    }

    return items.concat(next);
  }, []);
}


export function toPayload(update: StateUpdate<any>): Action {
  return update.action;
}

export function all(): boolean {
  return false;
}