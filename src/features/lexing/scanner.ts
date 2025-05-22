import { Token, TokenKind, TinSymbol } from '../../common/token';

export function scan(source: string): Token[] {
    return new Scanner(source).getTokens();
}

class Scanner {
    private tokens: Token[] = [];
    private i: number = 0;          // Current index
    private iToken: number = 0;     // Start of current token
    private iChar: number = 0;      // Index from last new line
    private iLine: number = 0;       // Current line

    private static keywords: Map<string, TokenKind> = new Map<string, TokenKind>(
        [
            [TinSymbol.If, 'if'],
            [TinSymbol.Else, 'else'],
            [TinSymbol.Tin, 'tin']
        ]
    );

    constructor(
        private source: string
    ) {}

    public getTokens(): Token[] {
        this.scanAll();
        return this.tokens;
    }

    /**
     * Scan all tokens in the source.
     * 
     * @remarks
     * Resulting tokens always start with an empty text token and end with a
     * text token then an eof token. 
     */
    private scanAll() {
        this.addToken('text');
        while (!this.eof()) {
            const c = this.next();
            if (
                c == TinSymbol.LeftBracket && 
                this.match(TinSymbol.LeftBracket)
            ) {
                // Add text token up to tag open.
                this.addToken('text', 2);

                this.addToken('tagOpen');
                this.scanTag();
            } else if (c == '\n') {
                // TODO: iLine only advances outside of a tag. Is this desired?
                this.iLine++;
            }
        }
        this.addToken('text');
        this.addToken('eof');
    }

    /**
     * Scan all tokens in a single tag.
     * 
     * @remarks
     * This should be called after a tag open has already been scanned.
     */
    private scanTag() {
        while (!this.eof()) {
            let foundWhitespace = false;
            while (this.next(Scanner.isWhitespace)) foundWhitespace = true;
            if (foundWhitespace) this.addToken('whitespace');

            switch (this.next()) {
                case TinSymbol.Tilde:
                    this.addToken('tilde');
                    break;
                case TinSymbol.Colon:
                    this.addToken('colon');
                    break;
                case TinSymbol.Comma:
                    this.addToken('comma');
                    break;
                case TinSymbol.LeftBracket:
                    this.error('Left brackets should not appear inside a ' + 
                        'tag. (Nested tags are not allowed.)');
                    break;
                case TinSymbol.RightBracket:
                    if (this.match(']')) {
                        this.addToken('tagClose');
                        return;
                    }
                    else {
                        this.error("Expected ']'");
                        break;
                    }
                default:
                    if (this.next(Scanner.isAlpha)) this.scanName();
                    else this.error("Unexpected character");
                    break;
            }
        }
    }

    private scanName() {
        while(this.next(Scanner.isAlphaNumeric));
        let name = this.source.substring(this.iToken, this.i);
        if (Scanner.keywords.has(name)) 
            this.addToken(Scanner.keywords.get(name) as TokenKind);
        else this.addToken('identifier');
    }

    /**
     * Advance the index if the next character matches `char`. 
     * 
     * @returns true iff the characters match.
     */
    private match(char: string): boolean {
        return this.next((c: string) => c == char) !== null;
    }

    /**
     * Advance the index if a given predicate holds on the next character.
     * 
     * @returns the character read if the predicate held. Otherwise, `null`.
     */
    private next(
        predicate: (c: string) => boolean = (_) => true
    ): string | null {
        let char = this.peek();
        let matches = predicate(char);
        if (matches) {
            this.i++;
            this.iChar++;
        }
        return matches? char : null;
    }

    private eof(ahead: number = 0): boolean {
        return this.i + ahead >= this.source.length;
    } 

    private peek(ahead: number = 0): string {
        if (this.eof(ahead)) return '\0';
        return this.source.charAt(this.i + ahead);
    }

    /**
     * Add a token whose lexeme is the substring from the last token 
     * (exclusive) up to the current index (exclusive), possibly ignoring some
     * trailing characters.
     * 
     * @param kind - The kind of token to add
     * @param ignoreCount - The number of trailing characters to ignore
     * 
     * @remarks
     * Assume that there is no new line within `ignoreCount` behind the 
     * current index.
     */
    private addToken(kind: TokenKind, ignoreCount: number = 0) {
        let iEnd = Math.max(this.i - ignoreCount, this.iToken);
        let lexeme = this.source.substring(this.iToken, iEnd);
        this.tokens.push({
            lexeme: lexeme, 
            kind: kind, 
            iLine: this.iLine, 
            iChar: this.iChar - (this.i - iEnd)
        });
        this.iToken = iEnd;
    }

    private error(message: string) {
        // TODO
        this.addToken('bad');
        //console.log(message + ' at ' + this.line + ':' + this.iChar + '.');
    }

    private static isAlpha(c: string) {
        return /^[a-z]*$/i.test(c);
    }

    private static isAlphaNumeric(c: string) {
        return /^[a-z0-9]*$/i.test(c);
    }

    private static isWhitespace(c: string) {
        return /^[ \n\r]/.test(c);
    }
}
