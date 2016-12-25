'use strict'

const ValidateError = require('./validateError')

function formatMissedKeyError(key) {
  return `${key} is required`
}

function formatInvalidRegexError(key) {
  return `Invalid ${key} format`
}

module.exports = {
  _checkRequired(key, param) {
    if (param === null || param === undefined) {
      return formatMissedKeyError(key)
    }
  },
  _removeUnnecessaryKeys(param, accept) {
    const result = {}

    for(const key in param) {
      if (accept.indexOf(key) !== -1) {
        result[key] = param[key]
      }
    }

    return result
  },
  _checkSpec(key, val, spec) {
    const _regex = spec[spec.findIndex(item => (item instanceof RegExp))]
    const regex = _regex ? _regex : /.+/
    if (val !== null && val !== undefined && val !== '' && !regex.test(val)) {
      return formatInvalidRegexError(key)
    }
  },
  _transform(param, specs) {
    const keys = Object.keys(specs)
    keys.forEach(key => {
      const patterns = specs[key]
      if (patterns.indexOf('notrim') < 0) {
        specs[key].push(this.trim)
      }
    })

    keys.forEach(key => {
      const todo = specs[key].filter(spec => typeof(spec) === 'function')

      todo.forEach(fn => {
        if (param[key] !== undefined) {
          try { param[key] = fn(param[key]) }
          catch(e) { param[key] = fn.apply(param[key]) }
        }
      })
    })

    return param
  },
  _assignDefaultValue(param, specKeys, defaultValue) {
    const result = param

    for (const specKey of specKeys) {
      if (defaultValue && result[specKey] === undefined && defaultValue[specKey] !== undefined) {
        // assign default value
        result[specKey] = defaultValue[specKey]
      }
    }

    return result
  },
  /**
   * parse param or throw error
   * 
   * @param {any} param
   * @param {any[]} specs
   * @param {any} defaultValue
   * @returns return param or throw error
   */
  parse (param, specs, defaultValue) {
    if (!param) {
      param = {}
    }
    
    try {
      const missed = (() => {
        const results = []
        const keys = Object.keys(specs)

        keys.forEach(key => {
          const val = specs[key]
          if (val.indexOf('required') >= 0) {
            results.push(this._checkRequired(key, param[key]))
          }
        })

        return results.filter(item => item) // remove falsy value (false, null, 0, "", undefined and NaN)
      }).call(this)

      const allMissed = missed
      if (allMissed.length > 0) {
        throw new ValidateError(allMissed)
      }
      param = this._removeUnnecessaryKeys(param, Object.keys(specs))
      param = this._assignDefaultValue(param, Object.keys(specs), defaultValue)

      const failed = (() => {
        const results = []
        const keys = Object.keys(specs)

        keys.forEach(key => {
          const val = specs[key]
          results.push(this._checkSpec(key, param[key], val))
        })

        return results.filter(item => item) // remove falsy value (false, null, 0, "", undefined and NaN)
      }).call(this)

      if (failed.length > 0) {
        throw new ValidateError(failed)
      }
      return this._transform(param, specs)
    }
    catch (err) {
      if (err && err.code === 400) {
        throw err
      }
      else {
        throw new ValidateError(err.message || err)
      }
    }
  }
}