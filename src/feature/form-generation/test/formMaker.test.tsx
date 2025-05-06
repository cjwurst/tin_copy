import { test } from '@fast-check/vitest';
import { render, screen } from '@testing-library/react'
import { describe, expect } from 'vitest';
import { wellFormedParseArb, ParseResult } from '../../../common/test/syntaxArbs';
import Form from '../../../components/Form';
import parse from '../../parsing/parser';
import { scan } from '../../lexing/scanner';

describe('<Form />', () => {
    test.skip.prop([wellFormedParseArb])('should render', (result: ParseResult) => {
        expect(render(<Form root={result.root} />)).toBeDefined();
        screen.debug();
    });

    test('just messing around', () => {
        const root = parse(scan("Here's some text with a [[variableTag]] " + 
            "and an [[otherVariableTag]]."));
        render(<Form root={root}/>)
        screen.debug();
    });
});

