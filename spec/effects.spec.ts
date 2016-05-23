import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

import { Effect } from '../lib/metadata';
import { mergeEffects } from '../lib/effects';

describe('mergeEffects', function() {
  it('should merge all observable sources decorated with @Effect()', function(done) {
    class Fixture {
      @Effect() a = Observable.of('a');
      @Effect() b = Observable.of('b');
      @Effect() c = Observable.of('c');
    }

    const mock = new Fixture();
    const expected = ['a', 'b', 'c'];

    mergeEffects(mock).toArray().subscribe({
      next(actual) {
        expect(actual).toEqual(expected);
      },
      error: done,
      complete: done
    });
  });

  it('should merge effects from multiple instances', function(done) {
    class First {
      @Effect() a = Observable.of('a');
    }

    class Second {
      @Effect() b = Observable.of('b');
    }

    class Third {
      @Effect() c = Observable.of('c');
    }

    const expected = ['a', 'b', 'c'];

    mergeEffects([ new First(), new Second(), new Third() ]).toArray().subscribe({
      next(actual) {
        expect(actual).toEqual(expected);
      },
      error: done,
      complete: done
    });
  });
});