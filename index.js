/* globals HTMLElement */
require('setimmediate')
const random = () => Math.random().toString(36).substring(7)

let observed = arr => {
  let handler = {
    set: (...args) => {
      let [, key, value] = args
      if (arr.onchange) arr.onchange(...args)
      if (Array.isArray(value)) {
        value = observed(value)
      }
      arr[key] = value
      return true
    }
  }
  for (let i = 0; i < arr.length; i++) {
    let value = arr[i]
    if (Array.isArray(value)) {
      arr[i] = observed(value)
    }
  }
  return new Proxy(arr, handler)
}

let flat = function * (arr) {
  for (let i = 0; i < arr.length; i++) {
    let value = arr[i]
    if (Array.isArray(value)) yield * flat(value)
    else yield value
  }
}

let allarrays = function * (arr) {
  for (let i = 0; i < arr.length; i++) {
    let value = arr[i]
    if (Array.isArray(value)) {
      yield value
      yield * allarrays(value)
    }
  }
}

let raekwon = (host, arr) => {
  let ret = observed(arr)

  let promise = new Promise(resolve => {
    let sync = (...args) => {
      if (host.__timeout) clearImmediate(host.__timeout)
      host.__timeout = setImmediate(() => {
        let replacements = {}

        let mapv = function * (arr) {
          for (let r of flat(arr)) {
            /* istanbul ignore else */
            if (typeof r === 'string') yield r
            else if (typeof r === 'undefined') yield ''
            else if (typeof r === 'number') yield r.toString()
            else if (typeof r === 'boolean') yield r.toString()
            else if (r === null) yield ''
            else if (r instanceof HTMLElement) {
              let id = random()
              replacements[id] = r
              yield `<span raekwon="${id}"></span>`
            } else {
              throw new Error(`Unknown type in template return: ${typeof r}.`)
            }
          }
        }
        host.innerHTML = Array.from(mapv(ret)).join('')
        for (let id in replacements) {
          let span = host.querySelector(`span[raekwon="${id}"`)
          let rep = replacements[id]
          if (rep.parentNode) rep.parentNode.removeChild(rep)
          span.parentNode.replaceChild(rep, span)
        }
        resolve(ret)
      })
    }

    sync()

    for (let r of allarrays(ret)) {
      r.onchange = sync
    }
    ret.onchange = sync
  })
  return promise
}

module.exports = raekwon
module.exports.flat = flat
module.exports.observed = observed
module.exports.allarrays = allarrays
