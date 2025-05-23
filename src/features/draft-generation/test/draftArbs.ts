import { fc } from '@fast-check/vitest';
import { Draft } from '../draft.ts';
import { wellFormedParseArb, ParseResult } from '../../../common/arbs.ts';

export const draftArb = wellFormedParseArb.map((result: ParseResult) => {
    result.root
});
