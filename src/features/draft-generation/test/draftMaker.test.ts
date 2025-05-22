import { fc, test } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import { wellFormedParseArb, ParseResult } from '../../../common/arbs.ts';
import { makeDraft } from '../draftMaker.ts';
import { TinDoc, TextExpr, EOF, TinContext } from '../../../common/intermediates.ts';

// The draft maker maps (root, context) => draft.
describe('Draft maker', () => {
    test('should leave a plaintext template unchanged', () => {
        const CONTENT = 'Some plain text.';
        const root = TinDoc.make(
            TextExpr.make({ kind: 'string', payload: CONTENT}),
            EOF.make()
        );
        const draft = makeDraft(root, TinContext.make());
        return draft.content === CONTENT;
    });

    test.todo.prop([])('should generate a draft given a full context', () => {

    });

    test.todo('should fail given an incomplete context', () => {

    });

    test.todo('should fill number variables', () => {

    });

    test.todo('should fill string variables', () => {

    });
});
