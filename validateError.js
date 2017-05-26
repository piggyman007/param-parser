class ValidateError {
  constructor(message, errorType) {
    this.name = 'validate:err'
    this.code = 400
    this.errorType = errorType
    this.message = message || 'Unknown error'
    if (process.env.NODE_ENV !== 'production') {
      this.stack = (new Error()).stack // hide stack trace on prod
    }
  }
}

ValidateError.errorType = {
  MISSING: 'missing field(s)',
  INCORRECT_FORMAT: 'incorrect format',
  OTHER: 'other'
}

module.exports = ValidateError
