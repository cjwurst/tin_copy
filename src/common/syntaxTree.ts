import { Token, TokenKind } from './token';
import { Visitor } from "./visitor";
import { TinError } from '../feature/tin-errors/tinError';

const DUMMY_TOKEN = new Token('EOF', TokenKind.Bad, -1, -1);

/**
 * An abstract syntax tree node.
 */
export abstract class SyntaxTree {
    private m_errors: TinError[] = [];
    public get errors(): readonly TinError[] { return this.m_errors; }
    public get isGood(): boolean { return this.m_errors.length == 0; } 

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
     * Pass a visitor to be accepted as a catamorphism over the node's 
     * children.
     * 
     * @param visitor - The visitor to accept
     * @param initial - The initial value
     * @param accumulate - The operation which takes the accumulated value and 
     * a value from the tree and returns a new accumulated value.
     * 
     * @returns The result of accumulating `initial` by `accumulate` over the 
     * tree.
     * 
     * @remarks 
     * This function can be used to recursively visit an entire tree if the 
     * visitor orders children uniformly. Otherwise, the visitor can manually 
     * call `accept` on the nodes' members.
     */
    public acceptRecursive<T>(
        visitor: Visitor<T>, 
        initial: T,
        accumulate: (init: T, next: T) => T = (i, _) => i, 
    ): T {
        let result = initial;
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            result = accumulate(result, children[i].acceptRecursive(
                visitor, result, accumulate
            ));
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

    protected pushError(message: string, token: Token) {
        this.m_errors.push({ 
            kind: 'syntax',
            message: message, 
            iLine: token.line, 
            iChar: token.iChar 
        });
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

type TextExprContent = 
    | StringContent
    | VariableTagContent;

type StringContent = {
    kind: 'string',
    value: string
};

type VariableTagContent = {
    kind: 'variable',
    value: VariableTag
};

const defaultTextExprContent: StringContent = {
    kind: 'string',
    value: ''
};

/**
 * A text expression consisting of a list of string literals and variable tags
 */
export class TextExpr extends SyntaxTree {
    public readonly content: TextExprContent = defaultTextExprContent;
    public readonly tail: TextExpr | undefined;

    constructor(tokens: Token[]) {
        super();
        let token: Token | undefined;
        if (token = this.match(tokens, TokenKind.Text)) {
            this.content = { 
                kind: 'string', 
                value: token.lexeme
            };
            this.tail = new TextExpr(tokens);
        } else if (token = this.match(tokens, TokenKind.TagOpen)) {
            this.content = {
                kind: 'variable',
                value: new VariableTag(tokens)
            }
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
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitTextExpr(this);
    }
}

export class EOF extends SyntaxTree {
    constructor(tokens: Token[]) {
        super();
        if (!this.match(tokens, TokenKind.EOF)) {
            this.pushError(
                "Expected the end of the email body.", 
                this.peek(tokens)?? DUMMY_TOKEN
            );
        }
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
            this.pushError("Expected a variable tag.", 
                this.peek(tokens)?? DUMMY_TOKEN);
        }
    }

    /** @override */
    public get children(): SyntaxTree[] {
        return [];
    }

    public get name(): string | undefined {
        return this.identifier? this.identifier.lexeme : undefined;
    }

    /** @override */
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVariableTag(this);
    }
}