'use strict'

class  RegexpJsonItems {
  constructor(specs) {
    this.specs = specs
  }

  parse(key, val, parse) {
    if (!this.specs || typeof(this.specs) !== 'object') {
      return `invalid specs`
    }

    for (const item of val) {
      parse(item, this.specs)
    }
  }
}

module.exports = RegexpJsonItems