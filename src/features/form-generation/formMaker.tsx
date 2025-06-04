import React from 'react';
import * as syn from '../../common/syntaxTree.ts';
import { TinContext, TinValue } from '../var-declaration/tinContext.ts';
import { PiecewiseVisitor } from '../../common/visitor';
import * as assert from '../../common/staticAssert';

/**
 * Make a form (or part of a form) from a syntax tree root (or other node).
 */
export function makeForm(
    root: syn.SyntaxTree, 
    context: TinContext, 
    setVariable: (s: string, v: TinValue) => void
): React.ReactNode {
    return new FormMaker(context, setVariable).visit(root);
}

class FormMaker extends PiecewiseVisitor<React.ReactNode> {
    constructor(
        private readonly context: TinContext,
        private readonly setVariable: (s: string, v: TinValue) => void
    ) {
        super();
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
                input = this.visitVariableTag(content.payload);
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
        if (!syn.isGood(variableTag) || !variableTag.identifier) return <></>;
        
        const name = variableTag.identifier.lexeme;
        const value = TinContext.tryGet(this.context, name);
        if (!value) throw new Error(`Context does not contain identifier "name".`);
        switch (value.kind) {
            case 'string':
                return <input 
                    type='text' 
                    // TODO: Convert from lower camel case to spaces?
                    placeholder={name}
                    value={value.content}
                    onChange={e => { 
                        this.setVariable(name, TinValue.make(e.target.value));
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
}