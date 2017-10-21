# Raekwon - Multi-dimensional arrays as dynamic templates.

Binds a multi-dimensional array of partial strings and
elements to a host element.

<p>
  <a href="https://www.patreon.com/bePatron?u=880479">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" height="40px" />
  </a>
</p>

```javascript
let sub = raekwon.observed(['<div></div>'])
let arr = ['<h1>', 'Test', '</h1>', sub]
let el = document.createElement('test')
let proxy = raekwon(el, arr)
setTimeout(() => {
  el.innerHTML === '<h1>Test</h1><div></div>'
  let div = document.createElement('div')
  div.id = 'test-next'
  proxy.push(div)
  setTimeout(() => {
    el.innerHTML === '<h1>Test</h1><div></div><div id="test-next"></div>'
  }, 10)
}, 10)
```
