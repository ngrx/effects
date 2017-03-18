import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

import { Effect, mergeEffects } from '../src/effects';

describe('mergeEffects', function() {
  it('should merge all observable sources decorated with @Effect()', function(done) {
    class Fixture {
      @Effect() a = Observable.of('a');
      @Effect() b = Observable.of('b');
      @Effect({ dispatch: false }) c = Observable.of('c');
      @Effect() d() { return Observable.of('d'); }
    }

    const mock = new Fixture();
    const expected = ['a', 'b', 'd'];

    mergeEffects(mock).toArray().subscribe({
      next(actual) {
        expect(actual).toEqual(expected);
      },
      error: done,
      complete: done
    });
  });

  it('should merge all observable sources decorated with @Effect()', function(done) {
    class Fixture {
      @Effect() a = Observable.of('a');
      @Effect() b = Observable.of('b');
      @Effect({ dispatch: false }) c = Observable.of('c');
      @Effect() d() { return Observable.of('d'); }
    }

    const mock = new Fixture();
    const expected = ['a', 'b', 'd'];

    mergeEffects(mock).toArray().subscribe({
      next(actual) {
        expect(actual).toEqual(expected);
      },
      error: done,
      complete: done
    });
  });

  it('should merge all observable sources prefixed with `effect`', function(done) {
    class Fixture {
      effectA = Observable.of('a');
      effectB = Observable.of('b');
    }

    const mock = new Fixture();
    const expected = ['a', 'b'];

    mergeEffects(mock, 'effect').toArray().subscribe({
      next(actual) {
        expect(actual).toEqual(expected);
      },
      error: done,
      complete: done
    });
  });
});
