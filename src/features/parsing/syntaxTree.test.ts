import { test } from '@fast-check/vitest';
import { expect } from 'vitest';
import * as syn from './syntaxTree';
import * as arb from './syntaxTreeArbs';
import { TokenKind } from '../lexing/scanner';
import structuresMatch from './treeMatcher';

test.prop([arb.wellFormedParseArb], { 
    verbose: 2, 
    reporter: arb.syntaxErrorReporter
})(
    'should parse a well-formed sequence of tokens without error.',
    (parseResult) => {
        expect(parseResult.errorReport.count).to.equal(0);
    }
);

test.prop(arb.getTokenArbs(
    TokenKind.Text,
    TokenKind.Text,
    TokenKind.TagOpen,
    TokenKind.Identifier,
    TokenKind.TagClose,
    TokenKind.Text,
    TokenKind.EOF
))('should parse a sequence of variable tags and text blocks', 
    (...tokens) => {
        let ast = syn.SyntaxTree.parseFromTokens(tokens);
        expect(structuresMatch(ast, ast));
    }
);