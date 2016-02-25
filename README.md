babel-remove-props
==================

A [Babel][] transform removing any object properties you tell it to.

Properties in object literals `{prop: value}` and assignments `obj.prop = value`
are removed. Terms with property access in expressions `obj.prop` are converted
to `undefined`.

The transformation can be used for advanced minification, to remove some
properties you know won't be used, but that are not automatically detectable
as such.

[babel]: https://babeljs.io/

Usage
-----

Add `'transform-remove-props'` to `.babelrc` with a regular expression
matching the properties to remove:

```javascript
{
    plugins: [
        ['transform-remove-props', {regex: /^(removeMe|removeMeToo)$/}]
    ]
}
```

The transform is best used after transpiling to ES5 and bundling, but before
lossless minification (such as [Uglify][]).

[uglify]: http://lisperator.net/uglifyjs/

Example
-------
The following code:

```javascript
a.removeMe = 0;
a.removeMeToo = i++;
{removeMe: 1, doNotRemoveMe: 2}
```

is transpiled to:

```javascript
i++;
{doNotRemoveMe: 2}
```

Try running Babel with DEBUG=remove-props to see what exactly is being removed.

Options
-------

#### regex (required)

A regular expression that specifies properties to remove.

#### pureMembers and pureCallees

Properties ending chains of other property accesses or function calls:

```javascript
a.b.removeMe = 1;
a.b().removeMe = 2;
```

cannot be removed as a member access or a function may have side-effects.

To get rid of the whole expression (rather than just its right-hand side), pass
a `pureMembers`, respectively `pureCallees` option &ndash; in the above case a
regular expression matching `a.b`.

Pure callees is set to `pureFuncsWithUnusualExceptionRegex` from
[side-effects-safe][] by default.

[side-effects-safe]: https://github.com/wrwrwr/side-effects-safe

Installation
------------

```bash
npm install babel-cli babel-plugin-transform-remove-props
```
