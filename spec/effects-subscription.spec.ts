import { ReflectiveInjector } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { Effect } from '../src/effects';
import { EffectsSubscription } from '../src/effects-subscription';
import { EffectsConfiguration } from '../src/effects.config';


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

  it('should merge effects instances and subscribe them to the observer', () => {
    class Source {
      @Effect() a$ = of('a');
      @Effect() b$ = of('b');
      @Effect() c$ = of('c');
    }
    const instance = new Source();
    const observer: any = { next: jasmine.createSpy('next') };

    const subscription = new EffectsSubscription(observer, null, [ instance ]);

    expect(observer.next).toHaveBeenCalledTimes(3);
    expect(observer.next).toHaveBeenCalledWith('a');
    expect(observer.next).toHaveBeenCalledWith('b');
    expect(observer.next).toHaveBeenCalledWith('c');
  });

  it('should use `Effect` decorator in first priority and ignore prefix', () => {
    class Source {
      @Effect({ dispatch: false }) effectA$ = of('a');
    }
    const instance = new Source();
    const observer: any = { next: jasmine.createSpy('next') };

    const subscription = new EffectsSubscription(observer, null, [instance], <EffectsConfiguration> { registerEffectWithPrefix: 'effect'});

    expect(observer.next).toHaveBeenCalledTimes(1);
  });
});