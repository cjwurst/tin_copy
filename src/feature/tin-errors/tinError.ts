export type TinError = (
    | TinTagError
    | TinSyntaxError
    | TinDraftError
) & TinErrorCommon;

type TinErrorCommon = {
    message: string
};

type TinSourceError = {
    iLine: number,
    iChar: number
};

type TinTagError = {
    kind: 'tag'
} & TinSourceError;

type TinSyntaxError = {
    kind: 'syntax'
} & TinSourceError;

type TinDraftError = {
    kind: 'draft'
};