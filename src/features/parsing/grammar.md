# TinCopy Syntax

<!--
    Rocky, Erin, Auren, Amira, Suko, Ben, Joanna
    Portland Tech Calendar
-->

Tin's grammar specification is based on extended Backus-Naur form:

| Pattern | Meaning |
| ------- | ------- |
| **... =** | Production rule declaration |
| **&#124; ...** | Production rule branch |
| **...** | Non-terminal symbol |
| **'...'** | Terminal symbol |
| **\[...\]** | None or one |
| **\{...\}** | One or more |
| **\[\{...\}\]** | None or more |

<!-- 
    Changes to the grammar should be reflected in...
        the builder function for each `SyntaxTree` subtype,
        the recursion in each `PiecewiseVisitor` subclass, and
        the arbitraries that are structured by the syntax.
-->
## Grammar

### Top level
Since a TinCopy program simply produces an email body, it is essentially one 
big expression that produces a string. Instead of defining this string 
expression recursively, it is expressed as a series of "tag"s.

**tinDoc =\
&emsp;&#124; \[\{tag\}\] 'eof'**

> [!Note] 
> This approach returns control to more abstract symbols during recursive 
descent parsing - that way, the parser can distinguish between different paths 
with minimal lookahead. E.g. the "elseIfBlock" symbol can watch for "else", 
"elseIf" and "end"; but no other symbol needs to watch for these tokens.

Each "tag" symbol distinguishes between different kinds of tags, in particular
between variable declarations and expressions. They must always be followed 
with a "text" symbol which prevents multiple tags from appearing between a 
single pair of "tagOpen" and "tagClose" tokens. An empty tag is allowed.

**tag =\
&emsp;&#124; 'var' variableDec text\
&emsp;&#124; 'if' conditional text\
&emsp;&#124; arithmeticExpr text\
&emsp;&#124; text**

The user may think of TinCopy as literal text interspersed with tags, but the grammar expects tag text by default, and only considers text to be literal when surrounded by a "tagClose" and "tagOpen" tokens.

**text =\
&emsp;&#124; 'tagClose' 'textLiteral' 'tagOpen'**

> [!Note]
> During scanning, a "tagClose" token is prepended and a "tagOpen" appended to the email body for this reason.

### Variable declaration

All variables are declared in a lexical scope available globally *after* 
declaration. Optional attributes can be attached to specify type information,
value constraints, and formatting.

**variableDec =\
&emsp;&#124; identifier \['colon' attribute \[\{'comma' attribute\}\]\]**

**attribute =\
&emsp;&#124;**

### Conditionals and boolean expressions

**conditional =\
&emsp;&#124; condition text \[\{tag\}\] elseIfBlock**

**elseIfBlock =\
&emsp;&#124; 'elseIf' condition text \[\{tag\}\] elseIfBlock\
&emsp;&#124; \['else' condition text \[\{tag\}\]\] 'endIf'**

**condition = equality =\
&emsp;&#124; condition 'is' condition\
&emsp;&#124; disjunction**

**disjunction =\
&emsp;&#124; condition 'or' condition\
&emsp;&#124; conjunction**

**conjunction =\
&emsp;&#124; condition 'and' condition\
&emsp;&#124; boolNegation**

**boolNegation =\
&emsp;&#124; 'not' condition\
&emsp;&#124; boolGroup**

**boolGroup =\
&emsp;&#124; 'leftParen' condition 'rightParen'\
&emsp;&#124; identifier**

### Arithmetic expressions

**arithmeticExpr = sum =\
&emsp;&#124; arithmeticExpr '+' arithmeticExpr\
&emsp;&#124; arithmeticExpr '-' arithmeticExpr\
&emsp;&#124; product**

**product =\
&emsp;&#124; arithmeticExpr '*' arithmeticExpr\
&emsp;&#124; arithmeticExpr '/' arithmeticExpr\
&emsp;&#124; negation**

**negation =\
&emsp;&#124; '-' arithmeticExpr\
&emsp;&#124; group**

**group =\
&emsp;&#124; 'leftParen' arithmeticExpr 'rightParen'\
&emsp;&#124; identifier\
&emsp;&#124; 'numberLiteral'**
