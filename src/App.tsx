import './App.css';

import { Token, lex } from './lexer.ts';

function App() {
    const tokens: readonly Token[] = lex("one|two|three");
    const lines: React.ReactNode = tokens.map(
        t => <> 
            {t.toString()}<br /> 
        </>
    );
	return (
		<div>
			<h1>{lines}</h1>
		</div>
	)
}

export default App
