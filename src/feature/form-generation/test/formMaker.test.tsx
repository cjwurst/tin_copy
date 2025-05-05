import { test } from '@fast-check/vitest';
import { render, screen } from '@testing-library/react'
import { describe, expect } from 'vitest';
import { wellFormedTokensArb } from '../../../common/test/syntaxArbs';
import { Token } from '../../lexing/scanner';
import Form from '../../../components/Form';
import parse from '../../parsing/parser';
import { scan } from '../../lexing/scanner';

describe('<Form />', () => {
    test.prop([wellFormedTokensArb])('should render', (tokens: Token[]) => {
        expect(render(<Form root={parse(tokens.slice())} />)).toBeDefined();
    });

    test('just messing around', () => {
        const root = parse(scan("Here's some text with a [[variableTag]] " + 
            "and an [[otherVariableTag]]."));
        render(<Form root={root}/>)
        screen.debug();
    });
});

