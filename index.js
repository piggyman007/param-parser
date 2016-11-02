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
    if (!param) {
      return formatMissedKeyError(key)
    }
  },
  _removeUnnecessaryKeys(params, accept) {
    const result = {}

    for(const key in params) {
      if (accept.indexOf(key) !== -1) {
        result[key] = params[key]
      }
    }

    return result
  },
  _checkSpec(key, val, spec) {
    const _regex = spec[_.findIndex(spec, s => _.isRegExp(s))]
    const regex = _regex ? _regex : /.+/
    if (!_.isNull(val) && !_.isUndefined(val) && !regex.test(val)) {
      return formatInvalidRegexError(key)
    }
  },
  _checkNeedBy(needs, params) {
    return _.compact(_.map(needs, need => {
      if (!params[need]) {
        return formatMissedKeyError(need)
      }  
    }))
  },
  _trim(obj) {
    if (_.isString(obj)) {
      return obj.trim()
    } 
    return _.each(obj, (v, k) => {
      try { return v.toString().trim() } 
      catch (e) { console.log('') }
    })
  },
  _transform(params, specs) {
    const keys = Object.keys(specs)
    keys.forEach(key => {
      const patterns = specs[key]
      if (patterns.indexOf('notrim') < 0) {
        specs[key].push(this.trim)
      }
    })

    keys.forEach(key => {
      const todo = _.remove(specs[key], spec => _.isFunction(spec))
      _.forEach(todo, fn => {
        if (_.isNative(fn) && params[key] !== undefined) {
          try { params[key] = fn(params[key]) }
          catch(e) { params[key] = fn.apply(params[key]) }
        }
        else if (params[key] !== undefined) {
          params[key] = fn(params[key])
        }
      })
    })
    return params
  },
  /**
   * parse param or throw error
   * 
   * @param {any} params
   * @param {any[]} specs
   * @returns return param or throw error
   */
  parse (params, specs) {
    if (!params) {
      params = {}
    }
    
    try {
      const missed = _.compact((() => {
        const results = []
        const keys = Object.keys(specs)
        keys.forEach(key => {
          const val = specs[key]
          if (val.indexOf('required') >= 0) {
            results.push(this._checkRequired(key, params[key]))
          }
        })
        return results
      }).call(this))
      
      const need = _.flatten((() => {
        const results = []
        const keys = Object.keys(specs)
        keys.forEach(key => {
          const val = specs[key]
          if (_.findIndex(val, v => _.isArray(v)) > -1 && params[key]) {
            results.push(this._checkNeedBy(val[_.findIndex(val, (v) => _.isArray(v))], params))
          }
        })
        return results
      }).call(this))
      
      const allMissed = _.union(missed, need)
      if (!_.isEmpty(allMissed)) {
        throw new ValidateError(allMissed)
      }
      params = this._removeUnnecessaryKeys(params, _.keys(specs))
      const failed = _.compact((() => {
        const results = []
        const keys = Object.keys(specs)
        keys.forEach(key => {
          const val = specs[key]
          results.push(this._checkSpec(key, params[key], val))
        })
        return results
      }).call(this))
      if (!_.isEmpty(failed)) {
        throw new ValidateError(failed)
      }
      return this._transform(params, specs)
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