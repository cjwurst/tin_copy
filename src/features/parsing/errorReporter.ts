import * as syn from './syntaxTree';

/**
 * Report syntax errors encountered during the parsing of a syntax tree.
 */
export default function reportErrors(root: syn.SyntaxTree): string {
    return 'TODO';
}

class ErrorReporter extends syn.Visitor {
    public visitTinDoc(document: syn.TinDoc): void {

    }

    public visitTextExpr(textExpr: syn.TextExpr): void {

    }

    public visitEOF(eof: syn.EOF): void {

    }

    public visitVariableTag(variableTag: syn.VariableTag): void {

    }

}