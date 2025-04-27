/*global chrome*/
import './App.css'

export default function App() {
    const login = function () {
        chrome.identity.getAuthToken({interactive: true}, function(result) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
                console.log(result? 'result not null' : 'result null');
            } else {
                console.log(result);
            }
        });
    };

    return (
        <div>
            <button onClick={login}>Login</button>
        </div>
    )
}
