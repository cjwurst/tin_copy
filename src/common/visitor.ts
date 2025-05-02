import * as syn from './syntaxTree';

/**
 * A visitor to a syntax tree, as in the visitor pattern. Provides a unified 
 * interface between visitors and subclasses of `SyntaxTree`.
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

    protected abstract visit(node: syn.SyntaxTree): T;
}

/**
 * A visitor to a syntax tree which distinguishes between different types of
 * nodes.
 */
export abstract class PiecewiseVisitor<T> extends Visitor<T> {
    /** @override */
    protected visit(node: syn.SyntaxTree): T {
        return node.accept(this);
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