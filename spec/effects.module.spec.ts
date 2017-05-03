import { EffectsModule } from '../src/effects.module';
import { SingletonEffectsService } from '../src/singleton-effects.service';

describe('EffectsModule', () => {
  describe('forRoot', () => {
    it('should provide the SingletonEffectsService when the userConfig has the effectsAsSingletons flag set', () => {
      let result = EffectsModule.forRoot({ effectsAsSingletons: true });

      expect(result.providers).toContain(SingletonEffectsService);
    });

    it('should not provide the SingletonEffectsService when the userConfig does not have the effectsAsSingletons flag', () => {
      let result = EffectsModule.forRoot();

      expect(result.providers).not.toContain(SingletonEffectsService);
    });
  });
});
