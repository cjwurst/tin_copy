import { Token } from '../../common/token';
import { SyntaxTree, TinDoc } from '../../common/syntaxTree';

/* Since parsing is just the construction of an AST, I decided that it should 
live in the `SyntaxTree' subclass constructors. As a result, this module just 
calls the `TinDoc` constructor.*/

/** Parse a list of tokens. */
export default function parse(tokens: Token[]): SyntaxTree {
    /* Here the token queue is reversed, so that tokens can be removed in 
    constant time. We could use a different data structure to avoid the 
    linear time `reverse` call, but I don't think it will matter. */
    // TODO: Decide if this is a good approach.
    return new TinDoc((tokens.reverse()));
}