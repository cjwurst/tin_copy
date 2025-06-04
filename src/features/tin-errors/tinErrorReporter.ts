import * as syn from '../../common/syntaxTree.ts';

export type ErrorReport = {
    count: number,
    message: string
}

/**
 * Report errors encountered during the processing of a syntax tree.
 */
export function reportErrors(root: syn.SyntaxTree): ErrorReport {
    return syn.fold(
        root, 
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
