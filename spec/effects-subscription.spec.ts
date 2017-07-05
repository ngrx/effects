import { ReflectiveInjector } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { Effect } from '../src/effects';
import { EffectsSubscription } from '../src/effects-subscription';
import { Action } from '@ngrx/store';


describe('Effects Subscription', () => {
  it('should add itself to a parent subscription if one exists', () => {
    const observer: any = { next() { } };
    const root = new EffectsSubscription(observer, null, null);

    spyOn(root, 'add');
    const child = new EffectsSubscription(observer, root, null);

    expect(root.add).toHaveBeenCalledWith(child);
  });

  it('should unsubscribe for all effects when destroyed', () => {
    const observer: any = { next() { } };
    const subscription = new EffectsSubscription(observer, null, null);

    spyOn(subscription, 'unsubscribe');
    subscription.ngOnDestroy();

    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should merge effects instances and subscribe only the ones returning actions to the observer', () => {

    class TestAction implements Action {
      constructor(public type = 'test-action', public payload = 'test') {}
    }

    const action = new TestAction();
    const action2 = new TestAction('test2-action');
    class Source {
      @Effect() a$ = of(action);
      @Effect() b$ = of('b');
      @Effect({dispatch: false}) c$ = of('c');
      @Effect() d$ = of(action2);
    }
    const instance = new Source();
    const observer: any = { next: jasmine.createSpy('next') };

    const subscription = new EffectsSubscription(observer, null, [ instance ]);

    expect(observer.next).toHaveBeenCalledTimes(2);
    expect(observer.next).toHaveBeenCalledWith(action);
    expect(observer.next).toHaveBeenCalledWith(action2);
  });
});