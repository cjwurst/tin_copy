import { fc, test } from '@fast-check/vitest';
import { render } from '@testing-library/react'
import { describe, expect } from 'vitest';
import { wellFormedSyntaxTreeArbs, plainTextArb } from '../../../common/arbs.ts';
import Form from '../../../components/Form';
import { parse, scan } from '../../../common/transformations.ts';
import { TinSymbol } from '../../../common/intermediates.ts';
import { formTestFailReporter } from './formTestFailReporter.ts';

describe('<Form />', () => {
    test.prop(
        [wellFormedSyntaxTreeArbs.tinDoc], 
        { reporter: formTestFailReporter }
    )('should render', (root) => {
        expect(render(<Form root={root} />)).toBeDefined();
    });

    const INPUT_ROLE = 'textbox';
    test(
        'should not generate input elements from plain text', 
        () => {
            const root = parse(scan('Just some text.'));
            const { queryAllByRole } = render(<Form root={root} />);
            expect(queryAllByRole(INPUT_ROLE) === null);
        }
    );
    
    // Randomness here is probably not necessary - just experimenting.
    test('should make input for variable tags', ({ g }) => {
        /* Generate a random number of unique variable names. */
        const count = g(fc.nat, { min: 1, max: 10});
        const tagNames = new Array(count).fill('name').map((s, i) => s + i);

        // Generate a source containing a tag for each name.
        const makePlainText = () => g(() => plainTextArb);
        const source = [makePlainText(), ...tagNames.map((name) => 
            TinSymbol.DoubleLeftBracket + name + TinSymbol.DoubleRightBracket
                + makePlainText()
        )].join('');

        const tokens = scan(source);
        const root = parse(tokens);
        const { getByPlaceholderText } = render(<Form root={root} />);
        for (let i = 0; i < tagNames.length; i++) {
            // 'get...' queries throw if not exactly one element is found.
            getByPlaceholderText(tagNames[i]);
        }
    });
});

