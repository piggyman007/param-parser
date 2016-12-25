'use strict'

const _ = require('lodash')
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
  _checkNeedBy(needs, param) {
    return _.compact(_.map(needs, need => {
      if (!param[need]) {
        return formatMissedKeyError(need)
      }  
    }))
  },
  _trim(obj) {
    if (typeof(obj) === 'string') {
      return obj.trim()
    } 
    return _.each(obj, (v, k) => {
      try { return v.toString().trim() } 
      catch (e) { console.log('') }
    })
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
      const todo = _.remove(specs[key], spec => typeof(spec) === 'function')
      _.forEach(todo, fn => {
        if (_.isNative(fn) && param[key] !== undefined) {
          try { param[key] = fn(param[key]) }
          catch(e) { param[key] = fn.apply(param[key]) }
        }
        else if (param[key] !== undefined) {
          param[key] = fn(param[key])
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
      const missed = _.compact((() => {
        const results = []
        const keys = Object.keys(specs)
        keys.forEach(key => {
          const val = specs[key]
          if (val.indexOf('required') >= 0) {
            results.push(this._checkRequired(key, param[key]))
          }
        })
        return results
      }).call(this))
      
      const need = _.flatten((() => {
        const results = []
        const keys = Object.keys(specs)
        keys.forEach(key => {
          const val = specs[key]
          if (val.findIndex(v => Array.isArray(v)) > -1 && param[key]) {
            results.push(this._checkNeedBy(val[val.findIndex(v => Array.isArray(v))], param))
          }
        })
        return results
      }).call(this))
      
      const allMissed = _.union(missed, need)
      if (allMissed.length > 0) {
        throw new ValidateError(allMissed)
      }
      param = this._removeUnnecessaryKeys(param, Object.keys(specs))
      param = this._assignDefaultValue(param, Object.keys(specs), defaultValue)
      const failed = _.compact((() => {
        const results = []
        const keys = Object.keys(specs)
        keys.forEach(key => {
          const val = specs[key]
          results.push(this._checkSpec(key, param[key], val))
        })
        return results
      }).call(this))
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