import { Token, TokenKind } from "../feature/lexing/scanner";
import { Visitor } from "./visitor";

export function parse(tokens: Token[]): SyntaxTree {
    return SyntaxTree.parseFromTokens(tokens);
}

/**
 * An abstract syntax tree node.
 */
export abstract class SyntaxTree {
    private m_errors: SyntaxError[] = [];
    public get errors(): readonly SyntaxError[] { return this.m_errors; }
    public get isGood(): boolean { return this.m_errors.length > 0; } 

    public static parseFromTokens(tokens: Token[]): SyntaxTree {
        /* Here the token queue is reversed, so that tokens can be removed in 
        constant time. We could use a different data structure to avoid the 
        linear time `reverse` call, but I don't think it will matter. */
        // TODO: Decide if this is a good approach.
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
    public abstract accept<T>(visitor: Visitor<T>): T;

    /**
     * Pass a visitor to be accepted by children as a catamorphism over the tree.
     * 
     * @param visitor - The visitor to accept
     * @param initial - The initial value
     * @param accumulate - The operation which takes the accumulated value and 
     * a value from the tree and returns a new accumulated value.
     * 
     * @returns The result of accumulating `initial` by `accumulate` over the tree.
     * 
     * @remarks 
     * This function can be used to recursively visit an entire tree
     * if recursion is unconditional and orders children uniformly. Otherwise, 
     * the visitor can manually call `accept` on the nodes' members.
     */
    public acceptToChildren<T>(
        visitor: Visitor<T>, 
        initial: T,
        accumulate: (init: T, next: T) => T = (i, _) => i, 
    ): T {
        let result = initial;
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            result = accumulate(initial, children[i].accept(visitor));
        }
        return result;
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
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitTinDoc(this);
    }
}

/**
 * A text expression consisting of a list of string literals and variable tags
 */
export class TextExpr extends SyntaxTree {
    public readonly content: string | VariableTag = '';
    public readonly tail: TextExpr | undefined;

    private readonly isLiteral: boolean = false;

    constructor(tokens: Token[]) {
        super();
        let token: Token | undefined;
        if (token = this.match(tokens, TokenKind.Text)) {
            this.content = token.lexeme;
            this.tail = new TextExpr(tokens);
            this.isLiteral = true;
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

    public get literal(): string | undefined {
        if (this.isLiteral) 
            return this.content as string;
        return undefined;
    }

    public get variable(): VariableTag | undefined {
        if (!this.isLiteral) 
            return this.content as VariableTag;
        return undefined;
    }

    public tryGetLiteral(result: { literal: string }): boolean {
        if (this.isLiteral) {
            result.literal = this.content as string;
            return true;
        }
        return false;
    }

    /** @override */
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitTextExpr(this);
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
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitEOF(this);
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
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVariableTag(this);
    }
}

export type SyntaxError = {
    message: string
}