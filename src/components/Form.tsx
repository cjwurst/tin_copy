import * as syn from '../features/parsing/syntaxTree.ts';
import { TinContext, TinValue } from '../common/intermediates.ts';
import { makeTinContext, makeForm } from '../common/transformations.ts';
import { useState } from 'react';

export type FormProps = { 
    root: syn.SyntaxTree
};

export default function Form({ root }: FormProps): React.ReactNode {
    // Variables in this context are declared, but have a dummy value.
    const blankContext = makeTinContext(root);
    const [context, setContext] = useState(blankContext);
    const setVariable = (name: string, value: TinValue) => {
        setContext((oldContext) => 
            TinContext.copyWithChange(oldContext, name, value));
    }
    return makeForm(root, context, setVariable);
}