import { Token, TokenKind } from "../lexing/scanner";

/**
 * A visitor to a syntax tree, as in the visitor pattern. Provides a unified 
 * interface between visitors and subclasses of `SyntaxTree`.
 * 
 * @remarks
 * A concrete visitor extends either the `Visitor` or `UniformVisitor` 
 * subclasses, depending on how it acts on the different nodes of a tree.
 */
abstract class BaseVisitor {
    public abstract visitTinDoc(document: TinDoc): void;
    public abstract visitTextExpr(textExpr: TextExpr): void;
    public abstract visitEOF(eof: EOF): void;
    public abstract visitVariableTag(variableTag: VariableTag): void;

    protected abstract visit(node: SyntaxTree): void;
}

/**
 * A visitor to a syntax tree which distinguishes between different types of
 * nodes.
 */
export abstract class Visitor extends BaseVisitor{
    /** @override */
    protected visit(node: SyntaxTree): void {
        return node.accept(this);
    }
}

/**
 * A visitor which treats all subtypes of `SyntaxTree` the same.
 */
export abstract class UniformVisitor extends Visitor {
    /** @override */
    public visitTinDoc(document: TinDoc): void {
        this.visit(document);
    }

    /** @override */
    public visitTextExpr(textExpr: TextExpr): void {
        this.visit(textExpr);
    }

    /** @override */
    public visitEOF(eof: EOF): void {
        this.visit(eof);
    }

    /** @override */
    public visitVariableTag(variableTag: VariableTag): void {
        this.visit(variableTag);
    }
}

export type SyntaxError = {
    message: string
}

/**
 * An abstract syntax tree node.
 */
export abstract class SyntaxTree {
    private m_errors: SyntaxError[] = [];
    public get errors(): readonly SyntaxError[] { return this.m_errors; }

    public static parseFromTokens(tokens: Token[]): SyntaxTree {
        /* Here the token queue is reversed, so that tokens can be removed in 
        constant time. We could use a different data structure to avoid the 
        linear time `reverse` call, but I don't think it will matter. */
        return new TinDoc(tokens.reverse());
    }

    /** 
     * Accept a visitor, dispatching over the concrete type of `this`. 
     * 
     * @remarks 
     * This function must be overridden to call the appropriate 'visit' method
     * on `visitor`.
     * 
     * @abstract
     */
    public abstract accept(visitor: Visitor): void;

    /**
     * Pass a visitor to be accepted by children. 
     * 
     * @remarks 
     * This function can be used to recursively visit an entire tree
     * if recursion is unconditional and orders children uniformly. Otherwise, 
     * the visitor can manually call `accept` on the nodes' members.
     */
    public acceptToChildren(visitor: Visitor): void {
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            children[i].accept(visitor);
        }
    }

    public abstract get children(): SyntaxTree[];

    /**
     * Pop the next token if its kind is `kind`.
     */
    protected match(
        tokens: Token[],
        kind: TokenKind
    ): Token | undefined {
        return this.next(tokens, (k) => k == kind);
    }

    /**
     * Pop the next token from `tokens`, optionally if it passes a predicate.
     */
    protected next(
        tokens: Token[], 
        predicate: (k: TokenKind) => boolean = (_) => true
    ): Token | undefined {
        let token = this.peek(tokens);
        if (token? predicate(token.kind): false) {
            return tokens.pop() ?? undefined;
        }
        return undefined;
    }

    protected peek(
        tokens: Token[], 
        ahead: number = 0
    ): Token | undefined {
        return tokens.length > ahead? tokens[tokens.length-ahead-1] : undefined;
    }

    protected error(message: string) {
        this.m_errors.push({ message });
    }
}

export class TinDoc extends SyntaxTree {
    public readonly content: TextExpr;
    public readonly eof: EOF;

    constructor(tokens: Token[]) {
        super();
        this.content = new TextExpr(tokens);
        this.eof = new EOF(tokens);
    }

    /** @override */
    public get children(): SyntaxTree[] {
        return [this.content, this.eof];
    }

    /** @override */
    public accept(visitor: Visitor): void {
        visitor.visitTinDoc(this);
    }
}

/**
 * A text expression consisting of a list of string literals and variable tags
 */
export class TextExpr extends SyntaxTree {
    public readonly content: string | VariableTag = '';
    public readonly tail: TextExpr | undefined;

    constructor(tokens: Token[]) {
        super();
        let token: Token | undefined;
        if (token = this.match(tokens, TokenKind.Text)) {
            this.content = token.lexeme;
            this.tail = new TextExpr(tokens);
        } else if (token = this.match(tokens, TokenKind.TagOpen)) {
            this.content = new VariableTag(tokens);
            this.tail = new TextExpr(tokens);
        }
    }

    /** @override */
    public get children(): SyntaxTree[] {
        const contentArray: SyntaxTree[] = 
            this.content instanceof VariableTag? [this.content] : [];
        const tailArray = this.tail? [this.tail] : [];
        return contentArray.concat(tailArray);
    }

    /** @override */
    public accept(visitor: Visitor): void {
        visitor.visitTextExpr(this);
    }
}

export class EOF extends SyntaxTree {
    constructor(tokens: Token[]) {
        super();
        if (!this.match(tokens, TokenKind.EOF)) 
            this.error("Expected the end of the email body.");
    }

    /** @override */
    public get children(): SyntaxTree[] {
        return [];
    }

    /** @override */
    public accept(visitor: Visitor): void {
        visitor.visitEOF(this);
    }
}

export class VariableTag extends SyntaxTree {
    public readonly identifier: Token | undefined;

    // Parses starting *after* the tag open.
    constructor(tokens: Token[]) {
        super();
        if (
            !(this.identifier = this.match(tokens, TokenKind.Identifier)) ||
            !this.match(tokens, TokenKind.TagClose)
        ) {
            this.error("Expected a variable tag.");
        }
    }

    /** @override */
    public get children(): SyntaxTree[] {
        return [];
    }

    /** @override */
    public accept(visitor: Visitor): void {
        visitor.visitVariableTag(this);
    }
}