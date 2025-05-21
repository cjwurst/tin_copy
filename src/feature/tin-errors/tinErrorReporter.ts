import * as syn from '../../common/syntaxTree';

export type ErrorReport = {
    count: number,
    message: string
}

/**
 * Report syntax errors encountered during the parsing of a syntax tree.
 */
export default function reportErrors(root: syn.SyntaxTree): ErrorReport {
    return syn.fold(
        root, 
        { count: 0, message: '' }, 
        processErrors, 
        combineReports
    );
}

function processErrors(root: syn.SyntaxTree): ErrorReport {
    const errors = root.errors;
    let report = { count: 0, message: ''};
    if (errors.length > 0)
        report.message += errors
            .map((e) => e.message)
            .join('\n') + '\n';
    report.count += errors.length;
    return report;
}

function combineReports(first: ErrorReport, second: ErrorReport): ErrorReport {
    return {
        count: first.count + second.count,
        message: first.message + second.message
    };
}
