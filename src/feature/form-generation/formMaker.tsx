import React from 'react';
import * as syn from '../../common/syntaxTree.ts';
import { TinContext, TinValue } from '../../common/tinContext.ts';
import { Token } from '../lexing/scanner.ts';
import { PiecewiseVisitor } from '../../common/visitor.ts';

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
        return <div>
            Start of form!
            { this.visitTextExpr(document.content) }
        </div>;
    }

    /** @override */
    public visitTextExpr(textExpr: syn.TextExpr): React.ReactNode {
        const variableTag = textExpr.variable;
        return <> 
            { variableTag? this.visitVariableTag(variableTag) :<></> }
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
        if (!variableTag.isGood) return <></>;
        
        const name = (variableTag.identifier as Token).lexeme;
        const value = this.context.tryGet(name);
        switch (typeof value?.content) {
            case typeof '':
                return <input 
                    type='text' 
                    // TODO: Convert from lower camel case to spaces
                    name={name}
                    value={value?.asString()}
                    onChange={e => { 
                        this.setVariable(name, new TinValue(e.target.value)) 
                    }}
                />
                break;

            case typeof 0:
                return <>TODO</>; // TODO

            case typeof true:
                return <>TODO</>; // TODO

            default:
                // TODO This should probably happen in a separate pass over the AST.
                this.setVariable(name, new TinValue(''));
                return <></>;
        }
    }
}