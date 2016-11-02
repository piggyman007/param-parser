# param-parser

A service that can validate, parse and format parameters for you by just calling one function.

### Installation

Install package from npm.

```sh
$ npm install param-parser --save
```

### Usage

* param-parser module provides `parse()` function to validate, parse and format parameter
* `parse()` function expects these arguments
  * param {object}: parameters to be parsed
  * specs {object[]}: array of spec (see `specs` section below)
* `parse()` function return parsed parameters {object}

### Example

```javascript
const parser = require('param-parser')

// define specs
const specs = {
    mobile_no: [
        'required' /* required field */,
        /^\d{10}$/ /* regex */
    ],
    gender: [
        'required' /* required field */, 
        /^(M|F|m|f)$/ /* regex */, 
        String.prototype.toLowerCase /* format function */
    ],
    language: [] /* no 'required' means optional field */
}

// input parameters
const input = {
    mobile_no: '1234567890',
    gender: 'M',
    lanauge: 'EN'
}

const param = parser.parse(input, specs) // parse input

/** will print
  * {
  *     mobile_no: '1234567890',
  *     gender: 'm', // format to lower case
  *     lanauge: 'EN'
  * }
  */
console.log(param)
```

### specs

A specs is an array of each spec.

* to define 'required' field, add `required` to spec, e.g., 
```javascript
const specs = {
    mobile_no: [ 'required' ] /* required field */,
    gender: [] /* optional field */
}
```

* regex is supported to validate each parameter, e.g., 
```javascript
const specs = {
    mobile_no: [ 'required',  /^\d{10}$/ ] /* validate with regex */,
    gender: [ /^(M|F|m|f)$/ ] /* validate with regex */,
    language: [] /* validate without regex */
}
```

* support native format function, e.g., 

```javascript
const specs = {
    gender: [ 'required', /^(M|F|m|f)$/, String.prototype.toLowerCase ] /* format value to lower case */,
    language: [ String.prototype.toUpperCase ] /* format value to upper case */,
    amount: [ parseFloat ] /* format value to float */
}
```

* support custom format function, e.g., 

```javascript
function formatMoney(num) {
    return `${num} dollar`
}

const specs = {
    amount: [ formatMoney ] /* format using formatMoney function */
}
```

License
----

MIT