import './App.css';

import { Token, scan } from '../features/lexing/scanner.ts';
import { parse } from '../common/syntaxTree.ts'
import { Form } from './Form.tsx';

export default function App() {
    const tokens: Token[] = scan("Here's some text with a [[variableTag]] and an [[otherVariableTag]].");
    const root = parse(tokens);
    return <Form root={root}/>;
}
