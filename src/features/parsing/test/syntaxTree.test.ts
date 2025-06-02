import { test } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import { syntaxTestFailReporter } from './syntaxTestFailReporter';
import { Token, TokenKind, VariableTag } from '../../../common/intermediates.ts';
import { wellFormedParseArb } from './syntaxArbs.ts';
import * as parser from '../parser.ts';

// Note that when calling parse[node type], tokens should be in reverse order
describe('Parser', () => {
    test ('should parse a simple tin document', () => {
        const TEXT = 'lorem ipsum';
        const tokens: Token[] = [
            makeEmptyToken('eof'),
            makeEmptyToken('text'),
            { ...makeEmptyToken('text'), lexeme: TEXT },
        ];
        const tinDoc = parser.parseTinDoc(tokens);
        expect(tinDoc.errors.length).to.equal(0);
        expect(tinDoc.content.content.payload).toBe(TEXT);
    });

    test('should parse a variable tag', () => {
        const NAME = 'name0'
        const variableTag = parser.parseVariableTag(
            makeVariableTagMiddle(NAME)
        );
        expect(variableTag.errors.length).to.equal(0);
        expect(variableTag.identifier?.lexeme).toBe(NAME);
    });

    test('should parse a text expr with plain text and variables', () => {
        const NAME = 'id';
        const TEXT = 'some text';
        const tokens: Token[] = [
            { ...makeEmptyToken('text'), lexeme: TEXT },
            ...makeVariableTagMiddle(NAME),
            makeEmptyToken('tagOpen'),
        ];
        const textExpr = parser.parseTextExpr(tokens);
        expect(textExpr.errors.length).to.equal(0);
        expectGoodVariableTag(<VariableTag>textExpr.content.payload, NAME);
        expect(textExpr.tail).toBeDefined();
        expect(typeof textExpr.tail?.content.kind).toBe('string');
        expect(textExpr.tail?.content.payload).toBe(TEXT);
    });

    test('should parse eof', () => {
        const eof = parser.parseEOF([makeEmptyToken('eof')]);
        expect(eof.errors.length).to.equal(0);
    })

    test.prop([wellFormedParseArb], { 
        verbose: 2, 
        reporter: syntaxTestFailReporter
    })(
        'should parse a well-formed sequence of tokens without error.',
        (parseResult) => {
            expect(parseResult.errorReport.count).to.equal(0);
        }
    );
});

function makeEmptyToken(kind: TokenKind) {
    return {
        kind: kind,
        lexeme: '',
        iChar: -1,
        iLine: -1
    };
}

/** Make an identifier followed by a tag close (in stack order). */
function makeVariableTagMiddle(name: string): Token[] {
    const tokens: Token[] = [
        makeEmptyToken('tagClose'),
        { ...makeEmptyToken('identifier'), lexeme: name }
    ];
    return tokens;
}

function expectGoodVariableTag(variableTag: VariableTag | undefined, name: string): void {
    expect(variableTag).toBeDefined();
    expect(variableTag?.errors.length).to.equal(0);
    expect(variableTag?.identifier).toBeDefined();
    expect(variableTag?.identifier?.lexeme).toBe(name);
}
