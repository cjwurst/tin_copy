import { test } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import { wellFormedSyntaxTreeArbs } from '../../../common/arbs.ts';
import * as syn from '../../../common/syntaxTree.ts';
import { reportErrors } from '../../../common/tinErrors.ts';
import { makeTinContext } from '../tinContextMaker.ts';
import { TinContext } from '../tinContext.ts';

describe('Variable declaration', () => {
    test('should make an empty context from plain text', () => {
        const root = syn.TinDoc.make(
            syn.TextExpr.make(
                { kind: 'string', payload: 'lorem ipsum' },
                undefined
            ),
            syn.EOF.make()
        );
        const context = makeGoodContext(root);
        expect(context.size).toEqual(0);
    });

    test.prop([wellFormedSyntaxTreeArbs.variableTag])(
        'should declare a variable for an arbitrary variable tag',
        (variableTag) => {
            if (!variableTag.identifier) {
                throw new Error('variableTag arb should be well-formed but ' +
                    'is missing identifier');
            }
            const context = makeGoodContext(variableTag);
            expect(TinContext.tryGet(context, variableTag.identifier.lexeme))
        }
    )

    /* If we decide to separate variable declaration and variable use (almost 
    definitely), we can count the number of variable declaration nodes and 
    compare to the number of variables in a context. */
    test.todo.prop([wellFormedSyntaxTreeArbs.tinDoc])(
        'should declare a variable for each variable tag in a well-formed AST',
        (root) => {
            const variableCount = syn.fold<number>(
                root,
                0,
                                  // Insert the `kind` of a variable declaration node here
                (r) => r.kind === 'variableTag'? 1 : 0,
                (x, y) => x + y
            );
            const context = makeGoodContext(root);
            expect(context.size).toEqual(variableCount);
        }
    );

    test.prop([wellFormedSyntaxTreeArbs.tinDoc])(
        'should declare a variable for each variable tag in a well-formed AST',
        (root) => {
            const uniqueIdentifiers = syn.fold<Set<string>>(
                root, 
                new Set<string>(),
                (node) => {
                    if (node.kind === 'variableTag' && node.identifier) 
                        return new Set<string>([node.identifier.lexeme])
                    return new Set<string>();
                },
                (ids1, ids2) => new Set([...ids1, ...ids2])
            )
            const context = makeGoodContext(root);
            expect(context.size).toEqual(uniqueIdentifiers.size);
        }
    )
});

function makeGoodContext(root: syn.SyntaxTree): TinContext {
    const context = makeTinContext(root);
    const report = reportErrors(root);
    expect(report.count).toEqual(0);
    return context;
}

