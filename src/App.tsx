import './App.css';

import { Token, scan } from './feature/lexing/scanner.ts';

function App() {
    const tokens: readonly Token[] = scan("one|two|three");
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
