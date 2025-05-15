import React from 'react';
import * as syn from '../../common/syntaxTree';
import { makeTinValue, TinContext, TinValue } from '../../common/tinContext';
import { PiecewiseVisitor } from '../../common/visitor';
import * as assert from '../../common/staticAssert';

/**
 * Make a form from the root of a syntax tree.
 */
export default function makeForm(
    root: syn.SyntaxTree, 
    context: TinContext, 
    setVariable: (s: string, v: TinValue) => void
): React.ReactNode {
    return new FormMaker(context, setVariable).makeForm(root);
}

class FormMaker extends PiecewiseVisitor<React.ReactNode> {
    constructor(
        private readonly context: TinContext,
        private readonly setVariable: (s: string, v: TinValue) => void
    ) {
        super();
    }

    public makeForm(root: syn.SyntaxTree): React.ReactNode {
        return this.visit(root);
    }

    /** @override */
    public visitTinDoc(document: syn.TinDoc): React.ReactNode {
        return <>
            Start of form!
            { this.visitTextExpr(document.content) }
            { this.visitEOF(document.eof) }
        </>;
    }

    /** @override */
    public visitTextExpr(textExpr: syn.TextExpr): React.ReactNode {
        const content = textExpr.content;
        let input: React.ReactNode = <></>;
        switch (content.kind) {
            case 'string':
                break;
            case 'variable':
                input = this.visitVariableTag(content.value);
                break;
            default:
                assert.isNever(content);
        }
        return <> 
            { input }
            { textExpr.tail? this.visitTextExpr(textExpr.tail) : <></> }
        </>;
    }

    /** @override */
    public visitEOF(_: syn.EOF): React.ReactNode {
        return <>
            End of form!
        </>;
    }

    /** @override */
    public visitVariableTag(variableTag: syn.VariableTag): React.ReactNode {
        if (!variableTag.isGood || !variableTag.name) return <></>;
        
        const name = variableTag.name;
        const value = this.context.tryGet(name);
        if (!value) {
            if (name) {
                // TODO This should maybe happen in a separate pass over the AST?
                this.setVariable(name, makeTinValue(''));
            }
            return <></>;
        }

        switch (value.kind) {
            case 'string':
                return <input 
                    type='text' 
                    // TODO: Convert from lower camel case to spaces?
                    placeholder={name}
                    value={value.content}
                    onChange={e => { 
                        this.setVariable(name, makeTinValue(e.target.value));
                    }}
                />

            case 'number':
                return <>TODO</>; // TODO

            case 'boolean':
                return <>TODO</>; // TODO
        }
        assert.isNever(value);
    }
}