import { fc, test } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import { makeDraft } from '../draftMaker.ts';
import { Draft } from '../draft.ts';
import { TinValue, TinContext } from '../../../common/intermediates.ts';
import * as syn from '../../../common/syntaxTree.ts';
import { makeTinContext } from '../../../common/transformations.ts';
import { wellFormedSyntaxTreeArbs } from '../../../common/arbs.ts';
import { TinError } from '../../../common/tinErrors.ts';
import toPrettyString from '../../../common/prettyPrinter.ts';

// The draft maker maps (root, context) => draft.
describe('Draft maker', () => {
    test('should leave a plaintext template unchanged', () => {
        const TEXT = 'lorem ipsum';
        const root = syn.TinDoc.make(
            syn.TextExpr.make({ kind: 'string', payload: TEXT }, undefined),
            syn.EOF.make()
        );
        const context = makeTinContext(root);
        const draft = makeDraft(root, context);
        expect(draft.errors.length).to.equal(0);
        expect(draft.content).toBe(TEXT);
    });

    test('should fill a simple variable tag', () => {
        const IDENTIFIER = 'id';
        const VALUE = 'lorem ipsum';
        const variableTag = syn.VariableTag.make(IDENTIFIER);
        const context = makeTinContext(variableTag);
        context.set(IDENTIFIER, TinValue.make(VALUE));
        expect(makeDraft(variableTag, context).content).toBe(VALUE);
    });

    /* Note: This test does not check if the draft is filled correctly - only
    that it is filled without error. */
    //TODO: This test will probably have to change when we implement type checking.
    test.prop([wellFormedSyntaxTreeArbs.tinDoc])(
        'should generate a draft given a full context', 
        (root) => {
            const context = makeTinContext(root);
            fillBlankContext(context);
            const draft = makeDraft(root, context);
            attachDraftToString(root, draft);
            expect(draft.errors.length).to.equal(0);
        }
    );

    test('should fail given an incomplete context', () => {
        const ERROR_KIND: TinError['kind'] = 'draft';
        const root = syn.TinDoc.make(
            syn.TextExpr.make(
                { kind: 'string', payload: 'lorem ipsum ' },
                syn.TextExpr.make({ 
                    kind: 'variable', payload: syn.VariableTag.make('id') 
                })
            ),
            syn.EOF.make()
        );
        const draft = makeDraft(root, makeTinContext(root));
        expect(draft.errors.length).to.greaterThan(0);
        expect(draft.errors[0].kind).toBe(ERROR_KIND);
    });

    test('should fill number variables', () => {
        expectSimpleTagDrafts<number>(-1, 0, 1);
    });

    test('should fill string variables', () => {
        expectSimpleTagDrafts<string>('', 'lorem ipsum');
    });
});

function fillBlankContext(context: TinContext): void {
    let n: number = 0;
    context.forEach((_, key) => {
        context.set(key, { 
            kind: 'string', 
            content: 'entry' + (n++).toString() 
        });
    });
}

function expectSimpleTagDrafts<T>(
    ...contents: T extends TinValue['content']? T[] : never
): void {
    contents.map((content) => {
        const IDENTIFIER = 'id';
        const variableTag = syn.VariableTag.make(IDENTIFIER);
        const context = makeTinContext(variableTag);
        context.set(IDENTIFIER, TinValue.make(content));
        const draft = makeDraft(variableTag, context);
        //attachDraftToString(variableTag, draft);
        expect(draft.content).toBe(String(content));
    });
}

/**
 * Attach a `toString` method to a SyntaxTree node which returns information 
 * about the node and a given draft.
 * 
 * @remarks
 * This helper exists to customize test failure reporting.
 */
function attachDraftToString(node: syn.SyntaxTree, draft: Draft): void {
    Object.defineProperties(node, {
        [fc.toStringMethod]: { value: () => {
            const errorCount = draft.errors.length;
            let result = `AST: \n' + ${toPrettyString(node)} + 
                '\n generated draft with ${errorCount} errors: \n`;
            for (let i = 0; i < errorCount; i++)
                result += draft.errors[i].message + '\n';
            return result;
        }},
    });
}
