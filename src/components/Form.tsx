import * as syn from '../features/parsing/syntaxTree.ts';
import makeForm from '../features/form-generation/formMaker.tsx';
import { TinContext, TinValue } from '../common/intermediates.ts';
import { makeTinContext } from '../common/transformations.ts';
import { useState } from 'react';

export type FormProps = { 
    root: syn.SyntaxTree
};

export default function Form({ root }: FormProps): React.ReactNode {
    const blankContext = makeTinContext(root);
    const [context, setContext] = useState(blankContext);
    const setVariable = (name: string, value: TinValue) => {
        setContext((oldContext) => 
            TinContext.copyWithChange(oldContext, name, value));
    }
    return makeForm(root, context, setVariable);
}