'use strict'

const paramParser = require('.')


class  RegExpItems {
  constructor(regex, length) {
    this.regex = regex
    this.length = length
  }

  parse(key, val) {
    if ((this.regex instanceof RegExp) === false) {
      return `invalid regex (${this.regex})`
    }
    if (!this.length) {
      return `invalid spec length (${this.length})`
    }
    if (val.length !== this.length) {
      return `specs length is not equal to value length`
    }

    for (const item of val) {
      if (item !== null && item !== undefined && item !== '' && !this.regex.test(item)) {
      return `Invalid ${key} format`
    }
    }
  }
}

module.exports = RegExpItems