import * as syn from './syntaxTree.ts';
import makeForm from './feature/form-generation/formMaker.tsx';
import { TinContext, TinValue } from './tinContext.ts';
import { useState } from 'react';

export type FormProps = { 
    root: syn.SyntaxTree,
    context: TinContext
};

export function Form({ root }: FormProps): React.ReactNode {
    const [context, setContext] = useState(new TinContext());
    const setVariable = (name: string, value: TinValue) => {
        setContext((oldContext) => oldContext.copyWithChange(name, value));
    }
    return makeForm(root, context, setVariable);
}