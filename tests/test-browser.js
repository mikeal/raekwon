/* globals raekwon */
const cappadonna = require('cappadonna')
const path = require('path')
const test = cappadonna(path.join(__dirname, 'include.js'))

test('basic', async (page, t) => {
  t.plan(2)
  await page.appendAndWait(`<test-one></test-one>`, 'test-one')
  await page.evaluate(async () => {
    let el = document.querySelector('test-one')
    let arr = ['<h1>', 'Test', '</h1>']
    let proxy = await raekwon(el, arr)
    t.same(el.innerHTML, '<h1>Test</h1>')
    let div = document.createElement('div')
    div.id = 'test-next'
    proxy.push(div)
    setTimeout(() => {
      t.same(el.innerHTML, '<h1>Test</h1><div id="test-next"></div>')
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 100)
  })
  await page.waitFor('test-finished')
})

test('types', async (page, t) => {
  t.plan(1)
  await page.appendAndWait(`<test-one></test-one>`, 'test-one')
  await page.evaluate(async () => {
    let el = document.querySelector('test-one')
    let arr = [null, '', '<p>', true, false, undefined, 24, '</p>']
    let proxy = await raekwon(el, arr)
    t.same(el.innerHTML, '<p>truefalse24</p>')
    let div = document.createElement('div')
    div.id = 'test-next'
    proxy.push(div)
  })
  await page.waitFor('div#test-next')
})

test('sub-arrays', async (page, t) => {
  t.plan(2)
  await page.appendAndWait(`<test-one></test-one>`, 'test-one')
  await page.evaluate(async () => {
    let el = document.querySelector('test-one')
    let arr = [[[null, '', '<p>', true, false, undefined, 24, '</p>']]]
    let span = document.createElement('span')
    document.body.appendChild(span)
    arr.push(span)
    let proxy = await raekwon(el, arr)
    window._proxy = proxy
    t.same(el.innerHTML, '<p>truefalse24</p><span></span>')
    let div = document.createElement('div')
    div.id = 'test-next'
    proxy.push([div])
  })
  await page.waitFor('div#test-next')
  await page.evaluate(async () => {
    window._proxy[0][0].push(document.createElement('test-two'))
  })
  await page.waitFor('test-two')
  await page.evaluate(async () => {
    let el = document.querySelector('test-one')
    t.same(el.innerHTML, '<p>truefalse24</p><test-two></test-two><span></span><div id="test-next"></div>')
    document.body.innerHTML += '<test-finished></test-finished>'
  })
  await page.waitFor('test-finished')
})
