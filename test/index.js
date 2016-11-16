'use strict'

const expect = require('chai').expect
const parser = require('..')

describe('param-parser', () => {
  it('Should assign default values correctly', (done) => {
    const specs = { a: ['required'], b: [], c: [] }
    const input = { a: 'test', b: 'test' }
    const defaultValue = { b: 'b default', c: 'c default' }

    const expectedParam = { a: 'test', b: 'test', c: 'c default' }

    const param = parser.parse(input, specs, defaultValue)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should remove parameters that are not defined in specs', (done) => {
    const specs = { a: ['required'] }
    const input = { a: 'test', b: 'test', c: 'test' }
    const expectedParam = { a: 'test' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param passed', (done) => {
    const specs = { a: ['required'] }
    const input = { a: 'test' }
    const expectedParam = { a: 'test' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param (empty value) passed', (done) => {
    const specs = { a: ['required'] }
    const input = { a: '' }
    const expectedParam = { a: '' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param (null value) failed', (done) => {
    const specs = { a: ['required'] }
    const input = { a: null }

    try { parser.parse(input, specs) }
    catch (e) {
      expect(e.constructor.name).eql('ValidateError')
      done()
    }
  })

  it('Should parse required param (undefined value) failed', (done) => {
    const specs = { a: ['required'] }
    const input = { a: undefined }

    try { parser.parse(input, specs) }
    catch (e) {
      expect(e.constructor.name).eql('ValidateError')
      done()
    }
  })

  it('Should parse required param failed', (done) => {
    const specs = { a: ['required'] }
    const input = { }
    const expectedParam = { a: 'test' }

    try {
      const param = parser.parse(input, specs)
    }
    catch (e) {
      expect(e.constructor.name).eql('ValidateError')
    }
    
    done()
  })

  it('Should parse optional param passed', (done) => {
    const specs = { a: ['required'], b: [] }
    const input = { a: 'test' }
    const expectedParam = { a: 'test' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse optional param (empty value) passed', (done) => {
    const specs = { a:[] }
    const input = { a: '' }
    const expectedParam = { a: '' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse optional param (null value) passed', (done) => {
    const specs = { a:[] }
    const input = { a: null }
    const expectedParam = { a: null }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse optional param (undefined value) passed', (done) => {
    const specs = { a:[] }
    const input = { a: undefined }
    const expectedParam = { a: undefined }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param with regex passed', (done) => {
    const specs = { a: ['required', /^[01]$/] }
    const input = { a: '0' }
    const expectedParam = { a: '0' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param with regex failed', (done) => {
    const specs = { a: ['required', /^[01]$/] }
    const input = { a: '0' }
    const expectedParam = { a: '0' }

    try {
      const param = parser.parse(input, specs)
    }
    catch (e) {s
      expect(e.constructor.name).eql('ValidateError')
    }
    
    done()
  })

  it('Should parse optional param with regex passed', (done) => {
    const specs = { a: [/^[01]$/] }
    const input = { a: '0' }
    const expectedParam = { a: '0' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse optional param with regex failed', (done) => {
    const specs = { a: [/^[01]$/] }
    const input = { a: '0' }
    const expectedParam = { a: '0' }

    try {
      const param = parser.parse(input, specs)
    }
    catch (e) {s
      expect(e.constructor.name).eql('ValidateError')
    }
    
    done()
  })

  it('Should parse required param with regex and prototype passed', (done) => {
    const specs = { a: ['required', /^en|EN|th|TH$/, String.prototype.toLowerCase] }
    const input = { a: 'EN' }
    const expectedParam = { a: 'en' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param with prototype toLowerCase passed', (done) => {
    const specs = { a: ['required', String.prototype.toLowerCase] }
    const input = { a: 'aBcDe' }
    const expectedParam = { a: 'abcde' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse optional param with prototype toUpperCase passed', (done) => {
    const specs = { a: [String.prototype.toUpperCase] }
    const input = { a: 'aBcDe' }
    const expectedParam = { a: 'ABCDE' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param with prototype Number passed', (done) => {
    const specs = { a: ['required', Number] }
    const input = { a: '10.10' }
    const expectedParam = { a: 10.1 }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param with prototype parseFloat passed', (done) => {
    const specs = { a: ['required', parseFloat] }
    const input = { a: '10.10' }
    const expectedParam = { a: 10.1 }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param with prototype parseInt passed', (done) => {
    const specs = { a: ['required', parseInt] }
    const input = { a: '10.10' }
    const expectedParam = { a: 10 }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })

  it('Should parse required param with custom formatted function passed', (done) => {
    function formatString(input) {
      return `updated ${input}`
    }

    const specs = { a: ['required', formatString] }
    const input = { a: 'a' }
    const expectedParam = { a: 'updated a' }

    const param = parser.parse(input, specs)
    expect(param).eql(expectedParam)
    
    done()
  })
})