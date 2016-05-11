import { Effect, getEffectKeys } from '../lib/metadata';

describe('Effect Decorator', () => {
  it('should get the effect keys for a class instance', () => {
    class Fixture {
      @Effect() a;
      @Effect() b;
      @Effect() c;
    }

    const mock = new Fixture();

    expect(getEffectKeys(mock)).toEqual(['a', 'b', 'c']);
  });

  it('should return an empty array if the class has not been decorated', () => {
    class Fixture {
      a;
      b;
      c;
    }

    const mock = new Fixture();

    expect(getEffectKeys(mock)).toEqual([]);
  });
});