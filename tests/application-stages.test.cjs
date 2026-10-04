const { test }=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const vm=require('node:vm')
const ts=require('typescript')
const api={}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/types/candidatura.types.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:api})
test('etapas configuradas mantêm a ordem sem duplicar inscrição e contratação',()=>{
  const stages=api.etapasDaVaga([{etapa:'CONTRATACAO',ordem:5},{etapa:'TRIAGEM',ordem:2},{etapa:'INSCRICAO',ordem:1},{etapa:'ENTREVISTA_RH',ordem:3},{etapa:'TRIAGEM',ordem:4}])
  assert.equal(stages.join(','),'INSCRICAO,TRIAGEM,ENTREVISTA_RH,CONTRATACAO')
})
test('processos sem configuração usam as etapas padrão e reconhecem situações finais',()=>{
  assert.equal(api.etapasDaVaga().join(','),api.ETAPAS.join(','))
  assert.equal(api.isFinalizada('EM_ANDAMENTO'),false)
  for(const status of ['APROVADA','REPROVADA','CANCELADA']) assert.equal(api.isFinalizada(status),true)
})
