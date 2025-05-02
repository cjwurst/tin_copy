import React from 'react';
import * as syn from '../../syntaxTree';
import { TinContext, TinValue } from '../../tinContext.ts';
import { Token } from '../lexing/scanner.ts';

/**
 * Make a form from the root of a syntax tree.
 */
export default function makeForm(
    root: syn.SyntaxTree, 
    context: TinContext, 
    setContext: (s: string, v: TinValue) => void
): React.ReactNode {
    return new FormMaker(context, setContext).makeForm(root);
}

class FormMaker extends syn.PiecewiseVisitor<React.ReactNode> {
    constructor(
        private readonly context: TinContext,
        private readonly setVariable: (s: string, v: TinValue) => void
    ) {
        super();
    }

    public makeForm(root: syn.SyntaxTree): React.ReactNode {
        return this.visit(root);
    }

    public visitTinDoc(document: syn.TinDoc): React.ReactNode {
        return <div>
            Start of form!
            { this.visitTextExpr(document.content) }
        </div>;
    }

    public visitTextExpr(textExpr: syn.TextExpr): React.ReactNode {
        let variableTag = textExpr.variable;
        let children = textExpr.tail? 
            this.visitTextExpr(textExpr.tail) : 
            <></>;
        return variableTag? 
            [this.visitVariableTag(variableTag), children] : 
            children;
    }

    public visitEOF(_: syn.EOF): React.ReactNode {
        return <>
            End of form!
        </>;
    }

    public visitVariableTag(variableTag: syn.VariableTag): React.ReactNode {
        if (!variableTag.isGood) return <></>;
        
        const name = (variableTag.identifier as Token).lexeme;
        const value = this.context.tryGet(name);

        switch (typeof value) {
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
                // TODO check attributes for type
                this.setVariable(name, new TinValue(''));
                return <></>;
        }
    }
}