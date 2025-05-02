import { test } from '@fast-check/vitest';
import { expect } from 'vitest';
import { wellFormedTokensArb } from '../../parsing/test/syntaxTreeArbs.ts';
import { Token, TokenKind } from '../../lexing/scanner.ts';

