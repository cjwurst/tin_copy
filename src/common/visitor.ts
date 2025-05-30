import * as syn from '../features/parsing/syntaxTree';
import { isNever } from './staticAssert';

/**
 * A visitor to an AST, as in the visitor pattern. Provides a unified interface
 * between visitors and subtypes of `SyntaxTree`.
 * 
 * @remarks
 * A concrete visitor extends either the `PiecewiseVisitor` or `UniformVisitor` 
 * subclasses, depending on how it acts on the different nodes of a tree.
 */
export abstract class Visitor<T> {
    public abstract visitTinDoc(document: syn.TinDoc): T;
    public abstract visitTextExpr(textExpr: syn.TextExpr): T;
    public abstract visitEOF(eof: syn.EOF): T;
    public abstract visitVariableTag(variableTag: syn.VariableTag): T;

    public abstract visit(node: syn.SyntaxTree): T;
}

/**
 * A visitor to a syntax tree which distinguishes between different types of
 * nodes.
 */
export abstract class PiecewiseVisitor<T> extends Visitor<T> {
    /** @override */
    public visit(node: syn.SyntaxTree): T {
        switch(node.kind) {
            case 'tinDoc':
                return this.visitTinDoc(node);
            case 'textExpr':
                return this.visitTextExpr(node);
            case 'variableTag':
                return this.visitVariableTag(node);
            case 'eof':
                return this.visitEOF(node);
            default:
                isNever(node);
        }
    }
}

/**
 * A visitor which treats all subtypes of `SyntaxTree` the same.
 */
export abstract class UniformVisitor<T> extends Visitor<T> {
    /** @override */
    public visitTinDoc(document: syn.TinDoc): T {
        return this.visit(document);
    }

    /** @override */
    public visitTextExpr(textExpr: syn.TextExpr): T {
        return this.visit(textExpr);
    }

    /** @override */
    public visitEOF(eof: syn.EOF): T {
        return this.visit(eof);
    }

    /** @override */
    public visitVariableTag(variableTag: syn.VariableTag): T {
        return this.visit(variableTag);
    }
}