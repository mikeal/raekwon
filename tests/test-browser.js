/* globals raekwon, same */
const puppeteer = require('puppeteer')
const { test } = require('tap')

const path = require('path')
const bl = require('bl')
const browserify = require('browserify')

const bundle = new Promise((resolve, reject) => {
  var b = browserify()
  b.add(path.join(__dirname, 'include.js'))
  b.bundle().pipe(bl((err, buff) => {
    if (err) return reject(err)
    resolve(buff)
  }))
})

const index = async inner => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body>
      <script>${await bundle}</script>
      ${await inner}
    </body>
  </html>
  `
}

let browser

test('setup', async t => {
  browser = await puppeteer.launch()
  t.end()
})

const getPage = async (t, inner) => {
  const page = await browser.newPage()
  page.on('console', msg => console.log(msg.text))
  page.on('error', err => { throw err })
  page.on('pageerror', msg => { throw new Error(`Page Error: ${msg}`) })
  await page.setContent(await index(inner))
  page.browser = browser
  let same = (x, y) => t.same(x, y)
  await page.exposeFunction('same', (x, y) => {
    same(x, y)
  })
  return page
}

test('basic', async t => {
  t.plan(2)
  let page = await getPage(t, `<test-one></test-one>`)
  await page.waitFor('test-one')
  await page.evaluate(async () => {
    let el = document.querySelector('test-one')
    let arr = ['<h1>', 'Test', '</h1>']
    let proxy = raekwon(el, arr)
    setTimeout(() => {
      same(el.innerHTML, '<h1>Test</h1>')
      let div = document.createElement('div')
      div.id = 'test-next'
      proxy.push(div)
    }, 10)
  })
  await page.waitFor('div#test-next')
  await page.evaluate(async () => {
    let el = document.querySelector('test-one')
    same(el.innerHTML, '<h1>Test</h1><div id="test-next"></div>')
  })
  await page.close()
})

test('teardown', async t => {
  await browser.close()
  t.end()
})
