import { Token, TokenKind } from './token';
import { Visitor } from "./visitor";
import { TinError } from '../feature/tin-errors/tinError';

const DUMMY_TOKEN: Token = { lexeme: '', kind: 'bad', iChar: -1, iLine: -1 };

/**
 * An abstract syntax tree node.
 */
export abstract class SyntaxTree {
    /** 
     * Make an AST node without parsing.
     * 
     * @param nodeConstructor - The constructor of the type of node to make
     * @param nodeProperties - The properties of the node to initialize
     * 
     * @remarks
     * This function should only be used for testing purposes.
     */
    protected static makeNode<T extends SyntaxTree>(
        nodeConstructor: new () => T, 
        nodeProperties: Partial<T> = {}
    ): T {
        return Object.assign(new nodeConstructor(), nodeProperties);
    }

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
            iLine: token.iLine, 
            iChar: token.iChar 
        });
    }
}

export class TinDoc extends SyntaxTree {
    public readonly content: TextExpr = SyntaxTree.makeNode(TextExpr, {});
    public readonly eof: EOF = SyntaxTree.makeNode(EOF, {});

    public static makeTestNode(textExpr: TextExpr | undefined): TinDoc {
        return SyntaxTree.makeNode(TinDoc, {
            content: textExpr,
            eof: SyntaxTree.makeNode(EOF)
        });
    }

    constructor(tokens?: Token[]) {
        super();
        if (tokens) {
            this.content = new TextExpr(tokens);
            this.eof = new EOF(tokens);
        }
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

    public static makeTestNode(
        content: string | VariableTag, 
        tail: TextExpr | undefined
    ): TextExpr {
        const wrappedContent = {
            kind: (content instanceof VariableTag)? 'variable' : 'string',
            value: content
        }  as TextExprContent;
        return SyntaxTree.makeNode(TextExpr, {
            content: wrappedContent,
            tail: tail
        });
    }

    constructor(tokens?: Token[]) {
        super();
        if (!tokens) return this;
        let token: Token | undefined;
        if (token = this.match(tokens, 'text')) {
            this.content = { 
                kind: 'string', 
                value: token.lexeme
            };
            this.tail = new TextExpr(tokens);
        } else if (token = this.match(tokens, 'tagOpen')) {
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
    public static makeTesttNode(): EOF {
        return SyntaxTree.makeNode(EOF);
    }

    constructor(tokens?: Token[]) {
        super();
        if (tokens && !this.match(tokens, 'eof')) {
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

    public static makeTestNode(identifier: Token | undefined): VariableTag {
        return SyntaxTree.makeNode(VariableTag, {
            identifier: identifier
        });
    }

    // Parses starting *after* the tag open.
    constructor(tokens?: Token[]) {
        super();
        if (!tokens) return this;
        if (
            !(this.identifier = this.match(tokens, 'identifier')) ||
            !this.match(tokens, 'tagClose')
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