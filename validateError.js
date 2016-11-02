class ValidateError {
  constructor(message) {
    this.name = 'validate:err'
    this.code = 400
    this.message = message || 'Unknown error'
    if (process.env.NODE_ENV !== 'production') {
      this.stack = (new Error()).stack // hide stack trace on prod
    }
  }
}

module.exports = ValidateError