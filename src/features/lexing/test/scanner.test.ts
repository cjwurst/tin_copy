import { test } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import { scan } from '../../../common/transformations.ts';
import { Token, TokenKind, TinSymbol } from '../token.ts';
import { sourceArb } from './tokenArbs.ts';

// Note: These tests are brittle wrt dummy pre- and post-tags
describe('Scanner', () => {
    test.prop([sourceArb])('should preserve lexemes', (source) => {
        expect(scan(source).map((t) => t.lexeme).join('')).toBe(source);
    });
    
    test.prop([sourceArb.filter((s) => isPureText(s))])(
        'should scan symbols outside of a tag as text', 
        (source) => { 
            let tokens = scan(source);
            expect(tokens.length).toBe(3);
            expectDummy(tokens[0], tokens[2]);
            expect(tokens[1].kind == 'text');
        }
    );
    
    test('should scan an empty source to a list of two empty text tokens and an ' + 
        'EOF token', () => {
            let tokens = scan('');
            expect(tokens.length).toBe(3);
            expectDummy(tokens[0], tokens[2])
            expect(isEmpty(tokens[1]));
        }
    );
    
    test('should scan all kinds of token', () => {
        let source = 'ipsum' + 
            TinSymbol.DoubleLeftBracket + 
            TinSymbol.RightBracket + 
            TinSymbol.Tilde + 
            TinSymbol.Colon +
            TinSymbol.Comma +
            TinSymbol.If + ' ' +
            TinSymbol.Else + ' ' + 
            TinSymbol.Tin + ' ' + 
            'identifier' + 
            TinSymbol.DoubleRightBracket;
        let tokens = scan(source);
        let expectedKinds:TokenKind[] = [
            'text',
            'text',
            'tagOpen',
            'bad',
            'tilde',
            'colon',
            'comma',
            'if',
            'whitespace',
            'else',
            'whitespace',
            'tin',
            'whitespace',
            'identifier',
            'tagClose',
            'text',
            'eof'
        ]
        expect(tokens.length).toBe(expectedKinds.length);
        let length = Math.min(tokens.length, expectedKinds.length);
        for (let i = 0; i < length; i++)
            expect(tokens[i].kind).toBe(expectedKinds[i]);
    });
});

/**
 * Expect each scan to start with an empty text token and end with an eof.
 */
function expectDummy(firstText: Token, eof: Token) {
    expect(isEmpty(firstText));
    expect(eof.kind == 'eof');
}

function isEmpty(t: Token) { 
    t.kind == 'text' && t.lexeme == '';
}

function isPureText(s: string) {
    return !s.includes(TinSymbol.DoubleLeftBracket) && s.length > 0;
}
