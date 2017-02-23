'use strict'

class  RegexpJsonItems {
  constructor(specs) {
    this.specs = specs
  }

  parse(key, val, parse, defaultValue) {
    if (!this.specs || typeof(this.specs) !== 'object') {
      return `invalid specs`
    }

    const result = []
    for (const item of val) {
      const paramItem = parse(item, this.specs, defaultValue)
      result.push(paramItem)
    }

    return result
  }
}

module.exports = RegexpJsonItems