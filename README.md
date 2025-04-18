# Tin Copy
Tin Copy is a Google Chrome extension integrated with Gmail templates that allows the user to easily draft emails by filling out a form. Its intent is to be configured by designers with minimal experience using markup languages and operated by users with no special prerequisite skills. To configure, a Gmail template is annotated with a simple language that specifies which information should be entered by the user when drafting and how it should be processed to text. Tin Copy generates a form from the annotated Gmail template to be filled out by the user. Once the form is filled, the end result is a nicely formatted draft that's ready to send.

With Tin Copy, data entry is reduced as much as possible, and data processing is automated which makes it more efficient than manual find-and-replace. However, it is more flexible than existing email drafters since it depends on the user to collect the initial data using the generated form. For example, if data needs to be gathered from a webpage whose source is unavailable, a fully automated email drafter might require web-scraping then data-cleaning to match the particular format used by the drafter. Tin Copy is intended to act as a drafting tool whose role falls between a manual find-and-replace process and a fully-automated emailing tool. It is most suitable in situations where a small amount of data is needed, but the data is difficult to collect and process automatically.

## Annotation
A Gmail template can be prepared for Tin Copy by annotating it with tags in [[double brackets]]. Each Gmail template intended to be read by Tin Copy should start with a [[tin]] tag in the subject line. Any template tagged this way will show up in the template menu when selecting the extension. 

### Variables
Variables can be declared and inserted into the draft by simply naming the variable in a tag. A variable definition is the tag in which the variable first appears. Attributes can be added to a variable definition by preceding them with a single colon. If you want to declare a variable, but not write it to the final draft, you can precede the variable name with a tilde. A default value for the variable can follow the variable name after a space. 

#### Attributes
Attributes restrict the values that the user can enter into the form for that variable, and they may change how the variable appears in the form. Attributes can also specify a variable's type, allowing operations to act on them appropriately.

| Attribute | Meaning |
| --- | --- |
| bool | The variable is a "true"/"false" value. |
| int | The variable is an integer. |
| decimal | The variable is a real number. |
| percent | The variable is a percentage. |

#### Reserved words 
These words cannot be used as variable names:

### Expressions
An expression is a value written in terms of variables and literal values. Tin Copy supports simple arithmetic operations for numbers (variables with attributes "int", "decimal", or "percent"): addition and subtraction (+, -), multiplication and division (*, /), and unary negation (-). Booleans (variables with attribute "bool") can be combined with the "and", "or", and "not" operators. Numbers can be compared using less-than or greater-than operators, either exclusive ("<", ">") or inclusive ("<=", ">="). Expressions can be grouped with parentheses to control their evaluation order.

tin, if, end, else, and, or, not, string, int, bool, decimal, percent, range, from, to, incl, excl

### Conditional blocks
Any boolean expression can be used as a condition to branch over multiple blocks of text. A conditional block begins with an [[if (condition)]] tag followed by a block of text, then ends with an [[end if]] tag. A conditional block can also contain [[else if (condition)]] tags to add alternative blocks of text, and possibly an [[else]] tag to fall back on a default block of text if none of the preceding conditions are met.
