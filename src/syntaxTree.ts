import { Token, TokenKind } from "./scanner";

/**
 * A visitor to a concrete SyntaxTree, as in the visitor pattern.
 * 
 * @remarks
 * Visitor functions are named 'visit[concrete subclass]' since TS does not 
 * support function overloading.
 */
export abstract class Visitor {
    public abstract visitTinDoc(document: TinDoc): void;
    public abstract visitTextExpr(textExpr: TextExpr): void;
    public abstract visitEOF(eof: EOF): void;
    public abstract visitVariableTag(varaibleTag: VariableTag): void;

    protected visit(node: SyntaxTree): void {
        node.accept(this);
    }
}

/**
 * An abstract syntax tree node.
 */
export abstract class SyntaxTree {
    private children: SyntaxTree[] = [];

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
        // TODO
        console.log(message);
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
    public accept(visitor: Visitor): void {
        visitor.visitEOF(this);
    }
}

export class VariableTag extends SyntaxTree {
    public readonly identifier: Token | undefined;

    constructor(tokens: Token[]) {
        super();
        if (
            !this.match(tokens, TokenKind.TagOpen) ||
            !(this.identifier = this.match(tokens, TokenKind.Identifier)) ||
            !this.match(tokens, TokenKind.TagClose)
        ) {
            this.error("Expected a variable tag.");
        }
    }

    /** @override */
    public accept(visitor: Visitor): void {
        visitor.visitVariableTag(this);
    }
}