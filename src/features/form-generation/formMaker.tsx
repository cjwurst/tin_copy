import React from 'react';
import * as syn from '../../common/syntaxTree.ts';
import { TinContext, TinValue } from '../var-declaration/tinContext.ts';
import * as assert from '../../common/staticAssert';

type VarSetter = (s: string, v: TinValue) => void;

/**
 * Make a form (or part of a form) from a syntax tree root (or other node).
 */
export function makeForm(
    root: syn.SyntaxTree, 
    context: TinContext, 
    setVariable: VarSetter
): React.ReactNode {
    switch(root.kind) {
        case 'tinDoc':
            return makeTinDocEntry(root, context, setVariable);
        case 'textExpr':
            return makeTextExprEntry(root, context, setVariable);
        case 'variableTag':
            return 
        case 'eof':
            return <>
                End of form!
            </>;
        default:
            assert.isNever(root);
    }
}

function makeTinDocEntry(
    tinDoc: syn.TinDoc,
    context: TinContext, 
    setVariable: VarSetter
): React.ReactNode {
    return <>
        Start of form!
        { makeTextExprEntry(tinDoc.content, context, setVariable) }
        { makeForm(tinDoc.eof, context, setVariable) }
    </>;
}

function makeTextExprEntry(
    textExpr: syn.TextExpr,
    context: TinContext, 
    setVariable: VarSetter
): React.ReactNode {
    const content = textExpr.content;
    let input: React.ReactNode = <></>;
    switch (content.kind) {
        case 'string':
            break;
        case 'variable':
            input = makeVariableTagEntry(content.payload, context, setVariable);
            break;
        default:
            assert.isNever(content);
    }
    return <> 
        { input }
        { textExpr.tail? 
            makeTextExprEntry(textExpr.tail, context, setVariable) : 
            <></> 
        }
    </>;
}

function makeVariableTagEntry(
    variableTag: syn.VariableTag,
    context: TinContext, 
    setVariable: VarSetter
): React.ReactNode {
    if (!syn.isGood(variableTag) || !variableTag.identifier) return <></>;
        
    const name = variableTag.identifier.lexeme;
    const value = TinContext.tryGet(context, name);
    if (!value) throw new Error(`Context does not contain identifier "name".`);
    switch (value.kind) {
        case 'string':
            return <input 
                type='text' 
                // TODO: Convert from lower camel case to spaces?
                placeholder={name}
                value={value.content}
                onChange={e => { 
                    setVariable(name, TinValue.make(e.target.value));
                }}
            />
        case 'number':
            return <>TODO</>; // TODO
        case 'boolean':
            return <>TODO</>; // TODO
        default:
            assert.isNever(value);
    }
}