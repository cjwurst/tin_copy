# Tin Syntax

Rocky, Erin, Auren, Amira, Suko, Ben, Joanna

Portland Tech Calendar

## Key

Tin's grammar specification is based on extended Backus-Naur form.

| Pattern | Meaning |
| ------- | ------- |
| ... = | Production rule declaration |
| &#124; ... | Production rule branch |
| ... | Non-terminal symbol |
| '...' | Terminal symbol |
| \[...\] | None or one |
| \{...\} | One or more |
| \[\{...\}\] | None or more |

document =
    | textExpr 'eof'

textExpr = 
    | 'text' textExpr
    | variableTag textExpr
    | ''

variableTag =
    | 'tagOpen' 'identifier' 'tagClose'