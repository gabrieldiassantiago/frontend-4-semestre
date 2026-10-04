const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const exportsObject = {}
const source = ts.transpileModule(fs.readFileSync('lib/utils/profile-validation.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
vm.runInNewContext(source, { exports: exportsObject, URL, Date, Set })
const { formatPhone, phoneError, validateProfile, validateExperience, isWebUrl } = exportsObject

test('telefone aceita celular, fixo e +55; rejeita DDD inexistente e números incompletos', () => {
  for (const phone of ['(11) 91234-5678', '(12) 3456-7890', '+55 11 91234-5678']) assert.equal(phoneError(phone), undefined)
  for (const phone of ['123', '(20) 91234-5678', '(11) 81234-5678', '(11) 99999-9999']) assert.ok(phoneError(phone))
  assert.equal(formatPhone('+55 11 91234-5678'), '(11) 91234-5678')
})
test('rascunho vazio pode ser salvo; formação exige ano inteiro no intervalo e semestre válido', () => {
  const year = new Date().getFullYear()
  assert.equal(Object.keys(validateProfile({})).length, 0)
  assert.ok(validateProfile({}, 'formacao', true).expectedGraduationYear)
  for (const value of [year - 1, year + 11, year + 0.5]) assert.ok(validateProfile({expectedGraduationYear:value}).expectedGraduationYear)
  assert.equal(validateProfile({expectedGraduationYear:year}).expectedGraduationYear, undefined)
  assert.ok(validateProfile({currentSemester:1.5}).currentSemester)
})
test('experiência rejeita datas futuras, término anterior e ausência de término; trabalho atual dispensa término', () => {
  const data = {companyName:'Empresa', role:'Assistente', startDate:'2025-06', endDate:'2025-01', isCurrent:false}
  assert.ok(validateExperience(data, '2026-10').endDate)
  assert.ok(validateExperience({...data, startDate:'2027-01'}, '2026-10').startDate)
  assert.ok(validateExperience({...data, endDate:''}, '2026-10').endDate)
  assert.equal(Object.keys(validateExperience({...data, endDate:'2025-06'}, '2026-10')).length, 0)
  assert.equal(Object.keys(validateExperience({...data, isCurrent:true, endDate:''}, '2026-10')).length, 0)
})
test('links aceitam somente endereço web completo', () => {
  assert.equal(isWebUrl('https://example.com/projeto'), true)
  for (const url of ['example.com', 'javascript:alert(1)', 'ftp://example.com']) assert.equal(isWebUrl(url), false)
})
