import { NgModule } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { EffectsTestRunner } from './runner';


export function _createActions(runner: EffectsTestRunner): Actions {
  return new Actions(runner);
}

@NgModule({
  providers: [
    EffectsTestRunner,
    { provide: Actions, deps: [ EffectsTestRunner ], useFactory: _createActions }
  ]
})
export class EffectsTestingModule { }
