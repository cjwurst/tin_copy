import { Token } from '../../common/intermediates.ts';

export type TinError = TinErrorTypeByKind[TinErrorKind];

type TinErrorDetail = 
    | TinTagErrorDetail
    | TinSyntaxErrorDetail
    | TinDraftErrorDetail
    | TinVariableErrorDetail;

type TinErrorKind = TinErrorDetail['kind'];

type TinErrorTypeByKind = {
    [TKind in TinErrorKind]:
        Extract<TinErrorDetail, { kind: TKind }> & TinErrorCommon 
};

type TinErrorCommon = {
    message: string
};

type TinSourceError = {
    iLine: number,
    iChar: number
};
namespace TinSourceError {
    export function make(token: Token): TinSourceError {
        return {
            iChar: token.iChar,
            iLine: token.iLine
        };
    }
}

export type TinTagError = TinErrorTypeByKind['tag'];
type TinTagErrorDetail = {
    kind: 'tag'
} & TinSourceError;

export type TinSyntaxError = TinErrorTypeByKind['syntax'];
type TinSyntaxErrorDetail = {
    kind: 'syntax'
} & TinSourceError;

export type TinVariableError = TinErrorTypeByKind['variable'];
export namespace TinVariableError {
    export function make(token: Token, message: string): TinVariableError {
        return {
            kind: 'variable',
            iChar: token.iChar,
            iLine: token.iLine,
            message: message
        }
    }
}
type TinVariableErrorDetail = {
    kind: 'variable'
} & TinSourceError;

export type TinDraftError = TinErrorTypeByKind['draft'];
export namespace TinDraftError {
    export function make(message:string): TinDraftError {
        return {
            kind: 'draft',
            message: message
        };
    }
}
type TinDraftErrorDetail = {
    kind: 'draft'
};