/* globals HTMLElement */
const random = () => Math.random().toString(36).substring(7)

let observed = arr => {
  let handler = {
    set: (...args) => {
      let [, key, value] = args
      if (arr.onchange) arr.onchange(...args)
      arr[key] = value
      return true
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
  let replacements = {}
  let syncid = random()

  let mapv = function * (arr) {
    for (let r of flat(arr)) {
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

  let sync = () => {
    if (host.syncid !== syncid) return
    host.innerHTML = Array.from(mapv(ret)).join('')
    for (let id in replacements) {
      let span = host.querySelector(`span[raekwon="${id}"`)
      let rep = replacements[id]
      if (rep.parentNode) rep.parentNode.removeChild(rep)
      span.parentNode.replaceChild(rep, span)
    }
  }

  host.syncid = syncid
  sync()

  for (let r of allarrays(ret)) {
    r.onchange = sync
  }
  ret.onchange = sync
  return ret
}

module.exports = raekwon
module.exports.flat = flat
module.exports.observed = observed
module.exports.allarrays = allarrays
