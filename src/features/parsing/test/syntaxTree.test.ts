import { test } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import { syntaxTestFailReporter } from './syntaxTestFailReporter';
import { wellFormedParseArb } from './syntaxArbs';
import { getTokenArbs } from './syntaxArbs';

describe('Parser', () => {
    test.prop([wellFormedParseArb], { 
        verbose: 2, 
        reporter: syntaxTestFailReporter
    })(
        'should parse a well-formed sequence of tokens without error.',
        (parseResult) => {
            expect(parseResult.errorReport.count).to.equal(0);
        }
    );
    
    test.todo.prop(getTokenArbs(
        'text',
        'text',
        'tagOpen',
        'identifier',
        'tagClose',
        'text',
    ))('should parse a sequence of variable tags and text blocks', 
        (...tokens) => {
            
        }
    );
});
