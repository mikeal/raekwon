const {test} = require('tap')
const rae = require('../')

test('basics', t => {
  t.plan(4)
  let arr = rae.observed([])
  let i = 0
  arr.onchange = () => {
    i += 1
  }
  arr.push('asdf')
  t.same(1, arr.length)
  arr.shift()
  t.same(0, arr.length)
  t.ok(!arr[0])
  t.same(i, 3)
})

test('flat', t => {
  t.plan(13)
  let arr = [0, 1, [[2], 3, [4], 5], 6, 7, 8, [[[9, [[[[10]]]], 11]]], 12]
  let i = 0
  for (let x of rae.flat(arr)) {
    t.same(x, i)
    i++
  }
})

test('allarrays', t => {
  t.plan(11)
  let arr = [0, 1, [[2], 3, [4], 5], 6, 7, 8, [[[9, [[[[10]]]], 11]]], 12]
  let i = 0
  for (let x of rae.allarrays(arr)) {
    t.ok(Array.isArray(x))
    i++
  }
  t.same(i, 10)
})

test('sub arrays', t => {
  t.plan(2)
  let arr = rae.observed([[[]]])
  arr[0][0].onchange = () => {
    t.ok(true)
  }
  arr[0][0].push('test')
})
