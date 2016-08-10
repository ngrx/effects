import { merge } from 'rxjs/observable/merge';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

const METADATA_KEY = '@ngrx/effects';

export function Effect(): PropertyDecorator {
  return function(target: any, propertyName: string) {
    if (!(Reflect as any).hasOwnMetadata(METADATA_KEY, target)) {
      (Reflect as any).defineMetadata(METADATA_KEY, [], target);
    }

    const effects = (Reflect as any).getOwnMetadata(METADATA_KEY, target);

    (Reflect as any).defineMetadata(METADATA_KEY, [ ...effects, propertyName ], target);
  };
}

export function getEffectKeys(instance: any): string[] {
  const target = Object.getPrototypeOf(instance);

  if (!(Reflect as any).hasOwnMetadata(METADATA_KEY, target)) {
    return [];
  }

  return (Reflect as any).getOwnMetadata(METADATA_KEY, target);
}

export function mergeEffects(instance: any): Observable<any> {
  const observables: Observable<any>[] = getEffectKeys(instance).map(
    (key: string): Observable<any> => {
      if (typeof instance[key] === 'function') {
        return instance[key]();
      }
      return instance[key];
    }
  );

  return merge(...observables);
}
