import './App.css';

import React from 'react';
//import Form from './Form.tsx';

export default function App(): React.ReactNode {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
        console.log(token);
    });
    return <>Hiya, World.</>
    //return <Form root={root}/>;
}
