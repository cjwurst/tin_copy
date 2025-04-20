import { Token, TokenKind } from './scanner'
import { SyntaxTree, TinDoc, TextExpr, EOF} from './syntaxTree'

/**
 * A parser for a given string of tokens.
 * 
 * @remarks
 * This class exists to share subarrays of `tokens` between methods via start 
 * and end indices.
 */
class Parser {
    private readonly i: number = 0;

    constructor(
        private readonly tokens: Token[]
    ) {}

    public parseAll(): SyntaxTree {
        return this.parseTinDoc();
    }

    private parseTinDoc(): SyntaxTree {
        return new TinDoc(this.parseTextExpr(), this.parseEOF());
    }

    private parseTextExpr(): SyntaxTree {
        
    }

    private parseEOF(): SyntaxTree {

    }
}