const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const exportsObject = {}
const source = ts.transpileModule(fs.readFileSync('lib/utils/vaga-description.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText
vm.runInNewContext(source,{exports:exportsObject})
const normalize = exportsObject.normalizeVagaDescription

test('preserva descrições em texto e markdown', () => {
  const text = '### Requisitos\n- Comunicação\n- **Organização**'
  assert.equal(normalize(text), text)
})
test('converte texto do editor com títulos, listas e negrito', () => {
  const result = normalize('<h2>Requisitos</h2><ul><li><p><strong>Java</strong></p></li><li><p>Comunicação &amp; organização</p></li></ul><ol><li>Inscrição</li><li>Entrevista</li></ol>')
  assert.match(result,/### Requisitos/)
  assert.match(result,/- \*\*Java\*\*/)
  assert.match(result,/- Comunicação & organização/)
  assert.match(result,/1\. Inscrição/)
  assert.match(result,/2\. Entrevista/)
})
test('remove scripts, estilos e atributos; decodifica entidades', () => {
  const result = normalize('<script>alert(1)</script><style>body{color:red}</style><p onclick="alert(2)">A&#231;&#xE3;o &lt;exemplo&gt;</p>')
  assert.equal(result,'Ação <exemplo>')
})
