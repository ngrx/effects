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


export function toPayload(update: StateUpdate<any>): any {
  return update.action.payload;
}

export function all(): boolean {
  return false;
}
