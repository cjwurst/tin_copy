import { fc } from '@fast-check/vitest';
import { TinSymbol } from '../token';

const cleanDoubleLeftBracket = 
    '\\' + TinSymbol.DoubleLeftBracket.split('').join('\\');

export const nonPlainTextRegex = new RegExp(
    `^.*${cleanDoubleLeftBracket}.*$`
);

export const plainTextArb = fc.string().filter(
    (s) => !nonPlainTextRegex.test(s)
);