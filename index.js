'use strict'

const ValidateError = require('./validateError')
const RegExpItems = require('./regexpItems')
const RegexpJsonItems = require('./regexpJsonItems')

function formatMissedKeyError(key) {
  return `${key} is required`
}

function formatInvalidRegexError(key) {
  return `Invalid ${key} format`
}

function _checkRequired(key, param) {
  if (param === null || param === undefined) {
    return formatMissedKeyError(key)
  }
}

function _removeUnnecessaryKeys(param, accept) {
  const result = {}

  for(const key in param) {
    if (accept.indexOf(key) !== -1) {
      result[key] = param[key]
    }
  }

  return result
}

function _checkSpec(key, val, spec) {
  // handle RegExpItems
  const regexItems = spec[spec.findIndex(item => (item instanceof RegExpItems))]
  if (regexItems) {
    return regexItems.parse(key, val)
  }

  // handle RegExpItems
  const regexJsonItems = spec[spec.findIndex(item => (item instanceof RegexpJsonItems))]
  if (regexJsonItems) {
    return regexJsonItems.parse(key, val, parse)
  }
  
  const _regex = spec[spec.findIndex(item => (item instanceof RegExp))]
  const regex = _regex ? _regex : /.+/
  if (val !== null && val !== undefined && val !== '' && !regex.test(val)) {
    return formatInvalidRegexError(key)
  }
}

function _formatParamItem(item, fn) {
  try { 
    return fn(item) 
  }
  catch(e) { 
    return fn.apply(item) 
  }
}

function _transform(param, specs) {
  const keys = Object.keys(specs)
  // keys.forEach(key => {
  //   const patterns = specs[key]
  //   if (patterns.indexOf('notrim') < 0) {
  //     specs[key].push(String.prototype.trim)
  //   }
  // })

  keys.forEach(key => {
    const todo = specs[key].filter(spec => typeof(spec) === 'function')

    todo.forEach(fn => {
      if (param[key] !== undefined) {
        if (Array.isArray(param[key])) {
          const newParam = []
          for (const paramItem of param[key]) {
            newParam.push(_formatParamItem(paramItem, fn))
          }
          param[key] = newParam
        }
        else {
          param[key] = _formatParamItem(param[key], fn)
        }
      }
    })
  })

  return param
}

function _assignDefaultValue(param, specKeys, defaultValue) {
  const result = param

  for (const specKey of specKeys) {
    if (defaultValue && result[specKey] === undefined && defaultValue[specKey] !== undefined) {
      // assign default value
      result[specKey] = defaultValue[specKey]
    }
  }

  return result
}

function getMissItems(param, specs) {
  const results = []
  const keys = Object.keys(specs)

  keys.forEach(key => {
    const val = specs[key]
    if (val.indexOf('required') >= 0) {
      results.push(_checkRequired(key, param[key]))
    }
  })

  return results.filter(item => item) // remove falsy value (false, null, 0, "", undefined and NaN)
}

function getFailedItems(param, specs) {
  const results = []
  const keys = Object.keys(specs)

  keys.forEach(key => {
    const val = specs[key]
    results.push(_checkSpec(key, param[key], val))
  })

  return results.filter(item => item) // remove falsy value (false, null, 0, "", undefined and NaN)
}

/**
 * parse param or throw error
 * 
 * @param {any} param
 * @param {any[]} specs
 * @param {any} defaultValue
 * @returns return param or throw error
 */
function parse (param, specs, defaultValue) {
  if (!param) {
    param = {}
  }
  
  try {
    const allMissed = getMissItems(param, specs)
    if (allMissed.length > 0) {
      throw new ValidateError(allMissed)
    }
    param = _removeUnnecessaryKeys(param, Object.keys(specs))
    param = _assignDefaultValue(param, Object.keys(specs), defaultValue)

    const failed = getFailedItems(param, specs)
    if (failed.length > 0) {
      throw new ValidateError(failed)
    }
    return _transform(param, specs)
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

module.exports = {
  RegExpItems,
  RegexpJsonItems,
  parse
}