import { test } from '@fast-check/vitest';
import { expect } from 'vitest';
import * as syn from '../../../common/syntaxTree';
import * as arb from './parsingArbs';
import { wellFormedParseArb } from './parsingArbs';
import { getTokenArbs } from '../../../common/test/syntaxArbs';
import { TokenKind } from '../../lexing/scanner';

test.prop([wellFormedParseArb], { 
    verbose: 2, 
    reporter: arb.syntaxErrorReporter
})(
    'should parse a well-formed sequence of tokens without error.',
    (parseResult) => {
        expect(parseResult.errorReport.count).to.equal(0);
    }
);

test.prop(getTokenArbs(
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
        // TODO: Implement this test
    }
);