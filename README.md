js-schema
=========

js-schema is essentially a way to describe JSON schemas using a
much cleaner and simpler syntax. Schemas described this way
can be then serialized to standard JSON schema.

Examples
========

Object validation and filtering:

```javascript
var schema = require('js-schema');

var Duck = schema({
  quack : Function,
  feed : Function,
  age : Number.min(0).max(5)
  color : ['yellow', 'brown']
});

var myDuck = { quack : function() {}, feed : function() {}, age : 2, color : 'yellow' };
var myCat =  { purr  : function() {}, feed : function() {}, age : 3, color : 'black'  };
var animals = [myDuck, myCat, /*...*/ ];

console.log( Duck(myDuck) ); // true
console.log( Duck(myCat)  ); // false
console.log( animals.filter(Duck) ); // every Duck-like object
console.log( animals.filter(schema({ feed : Function })) ); // every animal that can be fed
```

Usage
=====

The first parameter passed to the `schema` function describes the schema, and the return value
is a new function called validator. Then the validator can be used to check any object against
the described schema as in the example above.

There are various patterns that can be used to describe a schema. For example,
`schema({n : Number})` returns a validation function which returns true when called
with an object that has a number type property called `n`. This is a combination of the
object pattern and the instanceof pattern. Most of the patterns are pretty intuitive, so
reading a schema description is quite easy even if you are not familiar with js-schema.
Most patterns accept other patterns as parameters, so composition of patterns is very easy.

Extensions are functions that return validator by themselves without using the `schema` function
as wrapper. These extensions are usually tied to native object constructors, like `Array`,
`Number`, or `String`, and can be used everywhere where a pattern is expected. Examples
include `Array.of(X)`, `Number.min(X)`, or `String.matches(/X/)`.

Reference - patterns
====================

Instanceof
----------

`schema(Class)(object)` (where `Class` is a function) is true if `object instanceof Class`.

Examples:
```javascript
schema(Number)(1)   == true;
schema(String)('x') == true;
schema(String)(1)   == false;

function Class() { /*...*/ }
var object = new Class();

schema(Class)(object)  == true;
schema(Class)({})      == false;
schema(Number)(object) == false;
```

Object
------

`schema({ a : pattern1, b : pattern2, ... })(object)` is true if `object` has a property named
`a` that matches `pattern1`, and has a property named `b` that matches `pattern2`, etc...

Examples:
```javascript
// used with the instanceof pattern:
schema({ a : Number })({ a : 1 })        == true;
schema({ a : Number })({ a : 1, b : 2 }) == true;
schema({ a : Number })({ b : 1 })        == false;
schema({ a : Number })({ a : 's' })      == false;
```

Primitive
---------

`schema(primitive)(variable)` (where `primitive` is a JavaScript primitive, e.g. boolean,
number, or string) is true if `r === variable`.

Examples:
```javascript
schema(1)(1) == true;
schema(1)(2) == false;

// used with the object pattern:
schema({ x : 'a' })({ x : 'a' }) == true;
schema({ x : 'a' })({ x : 'b' }) == false;
```

Or
--

`schema([pattern1, pattern2])(variable)` is true if `pattern1` _or_ `pattern2` matches `variable`.

Examples:
```javascript
// used with the instanceof and primitive pattern:
schema([Number, 'a', 'b'])(1)   == true;
schema([Number, 'a', 'b'])(42)  == true;
schema([Number, 'a', 'b'])('a') == true;
schema([Number, 'a', 'b'])('x') == false;
```

And
---

`schema([[pattern1, pattern2]])(variable)` is true if `pattern1` _and_ `pattern2` matches `variable`.

Examples:
```javascript
function Class(a) { this.a = a; }

// used with the instanceof and object pattern:
schema([[Class, {a : 5}]])(new Class(5)) == true;
schema([[Class, {a : 5}]])(new Class(3)) == false;
schema([[Class, {a : 5}]])({a : 5})      == false;
```

Nothing
-------

`schema(null)(variable)` is true if `variable` is `null` or `undefined`.

Examples:
```javascript
// used with the object pattern
schema({a : null})({b : 1})    == true;
schema({a : null})({a : null}) == true;
schema({a : null})({a : 1})    == false;
```

Anything
--------

`schema(undefined)(variable)` is true if `variable` is not `null` or `undefined`.

Examples:
```javascript
// used with the object pattern
schema({a : undefined})({a : 1})    == true;
schema({a : undefined})({b : 1})    == false;
schema({a : undefined})({a : null}) == false;
```

Reference - extensions
======================

Numbers
-------

Strings
-------

Objects
-------

Arrays
------

Functions
---------

Future plans
============

Defining and validating resursive data structures:

```javascript
// defining the data structure
var Tree = schema({ left : [Tree, Number], right : [Tree, Number] });

// validation
console.log( Tree({left : {left : 1, right : 2   }, right : 9}) ); // true
console.log( Tree({left : {left : 1, right : null}, right : 9}) ); // false
```

Generating random objects based on schema description:

```javascript
// generating random trees
console.log( schema.random(Tree) ); // {left : 0.123, right : {left : 0.2, right : 0.9}}

// generating an array of random trees for testing
var testcases = schema.random(Array.of(Tree));
test(testcases);
```

Installation
============

Using [npm](http://npmjs.org):

    npm install js-schema

License
=======

The MIT License

Copyright (C) 2012 Gábor Molnár <gabor.molnar@sch.bme.hu>

