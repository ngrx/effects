import { Injectable, OpaqueToken } from '@angular/core';

export const effectsConfig = new OpaqueToken('ngrx/effects: EffectsConfiguration');

export interface EffectsConfiguration {
    registerEffectWithPrefix?: string;
}