import * as syn from '../features/parsing/syntaxTree.ts';
import makeForm from '../features/form-generation/formMaker.tsx';
import { TinContext, TinValue } from '../common/tinContext.ts';
import { useState } from 'react';

export type FormProps = { 
    root: syn.SyntaxTree
};

export default function Form({ root }: FormProps): React.ReactNode {
    const [context, setContext] = useState(new TinContext());
    const setVariable = (name: string, value: TinValue) => {
        setContext((oldContext) => oldContext.copyWithChange(name, value));
    }
    return makeForm(root, context, setVariable);
}