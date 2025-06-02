import './App.css';

import { Token } from '../common/intermediates.ts';
import { scan, parse } from '../common/transformations.ts';
import Form from './Form.tsx';

export default function App() {
    const tokens: Token[] = scan("Here's some text with a [[variableTag]] and an [[otherVariableTag]].");
    const root = parse(tokens);
    return <Form root={root}/>;
}
