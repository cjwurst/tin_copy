import { test } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import parse from '../parser';
import * as arb from './syntaxErrorReporter';
import { wellFormedParseArb } from '../../../common/test/syntaxArbs';
import { getTokenArbs } from '../../../common/test/syntaxArbs';
import { TokenKind } from '../../../common/token';

describe('Parser', () => {
    test.prop([wellFormedParseArb], { 
        verbose: 2, 
        reporter: arb.syntaxErrorReporter
    })(
        'should parse a well-formed sequence of tokens without error.',
        (parseResult) => {
            expect(parseResult.errorReport.count).to.equal(0);
        }
    );
    
    test.todo.prop(getTokenArbs(
        TokenKind.Text,
        TokenKind.Text,
        TokenKind.TagOpen,
        TokenKind.Identifier,
        TokenKind.TagClose,
        TokenKind.Text,
        TokenKind.EOF
    ))('should parse a sequence of variable tags and text blocks', 
        (...tokens) => {
            let ast = parse(tokens);
            // TODO: Implement this test
        }
    );
});
