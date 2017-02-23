'use strict'

const paramParser = require('.')


class  RegExpItems {
  constructor(regex) {
    this.regex = regex
  }

  parse(key, val) {
    if ((this.regex instanceof RegExp) === false) {
      return `invalid regex (${this.regex})`
    }

    for (const item of val) {
      if (item !== null && item !== undefined && item !== '' && !this.regex.test(item)) {
      return `Invalid ${key} format`
    }
    }
  }
}

module.exports = RegExpItems