// TODO: Does this file belong in common?

import { Token } from '../../common/intermediates.ts';

export type TinError = TinErrorTypeByKind[TinErrorKind];

type TinErrorDetail = 
    | TinTagErrorDetail
    | TinSyntaxErrorDetail
    | TinDraftErrorDetail
    | TinVariableErrorDetail
    | TinTypeErrorDetail;

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

export type TinVariableError = TinErrorTypeByKind['variable'];
export namespace TinVariableError {
    export function make(token: Token, message: string): TinVariableError {
        return {
            ...TinSourceError.make(token),
            kind: 'variable',
            message: message
        };
    }
}
type TinVariableErrorDetail = {
    kind: 'variable'
} & TinSourceError;

export type TinTypeError = TinErrorTypeByKind['type'];
export namespace TinTypeError {
    export function make(token: Token, message: string): TinTypeError {
        return {
            ...TinSourceError.make(token),
            kind: 'type',
            message: message
        };
    }
}
type TinTypeErrorDetail = {
    kind: 'type'
} & TinSourceError;
