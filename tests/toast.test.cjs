const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function fixture(browser = true) {
  const cache = new Map();
  let responses = [];
  const calls = [];
  const globals = { Response, Headers, FormData, process: { env: {} }, document: { cookie: '' },
    fetch: async (url, options) => { calls.push({ url, options }); return responses.shift() ?? new Response('{}'); },
    ...(browser ? { window: {} } : {}),
  };
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(source, { ...globals, exports, require: name => load(name.startsWith('@/') ? name.slice(2) + '.ts' : path.resolve(path.dirname(file), name) + '.ts') }, { filename: file });
    return exports;
  }
  return { load, calls, respond: (...items) => { responses = items; }, store: load('lib/toast.ts') };
}

test('toasts são limitados, não se repetem e podem ser fechados', () => {
  const { store } = fixture();
  let changes = 0;
  const unsubscribe = store.subscribeToasts(() => changes++);
  store.toastSuccess('Salvo');
  store.toastSuccess('Salvo');
  assert.equal(store.getToasts().length, 1);
  for (const text of ['Foto', 'Currículo', 'Projeto']) store.toastSuccess(text);
  assert.equal(store.getToasts().length, 3);
  store.dismissToast(store.getToasts()[0].id);
  assert.equal(store.getToasts().length, 2);
  assert.equal(changes, 6);
  unsubscribe();
  assert.equal(fixture(false).store.getToasts().length, 0);
  const server = fixture(false).store;
  server.toastSuccess('Não mostrar no servidor');
  assert.equal(server.getToasts().length, 0);
});

test('somente respostas bem-sucedidas e válidas geram sucesso', async () => {
  const { load, store } = fixture();
  const { handleResponse } = load('lib/http/client.ts');
  await handleResponse(new Response('{}'));
  assert.equal(store.getToasts().length, 0);
  await assert.rejects(handleResponse(new Response('{"message":"Falhou"}', { status: 500 }), 'Salvo'));
  await assert.rejects(handleResponse(new Response('invalid'), 'Salvo'));
  assert.equal(store.getToasts().length, 0);
  await handleResponse(new Response(null, { status: 204 }), 'Excluído');
  assert.equal(store.getToasts()[0].message, 'Excluído');
});

test('ações da API notificam e leituras permanecem silenciosas', async () => {
  const cases = {
    candidate: ['createCandidateProfile', 'updateCandidateProfileMe', 'addCandidateExperience', 'updateCandidateExperience', 'deleteCandidateExperience', 'addCandidateProject', 'updateCandidateProject', 'deleteCandidateProject'],
    vagas: ['createVaga', 'updateVaga', 'deleteVaga'],
    candidatura: ['criarCandidatura', 'desistirCandidatura', 'avancarEtapa', 'decidirCandidatura', 'criarFeedback', 'atualizarFeedback', 'removerFeedback'],
    company: ['updateCompanyProfileMe'],
    auth: ['registerUser', 'registerCompany', 'verifyEmail', 'resendCode'],
  };
  for (const [service, names] of Object.entries(cases)) {
    for (const name of names) {
      const f = fixture();
      await f.load(`lib/services/${service}.service.ts`)[name]({}, {}, {});
      assert.equal(f.store.getToasts().length, 1, name);
      const failed = fixture();
      failed.respond(new Response('{"message":"Falha"}', { status: 500 }));
      await assert.rejects(failed.load(`lib/services/${service}.service.ts`)[name]({}, {}, {}));
      assert.equal(failed.store.getToasts().length, 0, name + ' falhou');
    }
  }
  const f = fixture();
  await f.load('lib/services/candidate.service.ts').getCandidateProfileMe();
  assert.equal(f.store.getToasts().length, 0);
});

test('criação auxiliar antes do upload não duplica avisos', async () => {
  const f = fixture();
  f.respond(new Response('{}', { status: 404 }), new Response('{}', { status: 201 }), new Response('{}'));
  await f.load('lib/services/candidate.service.ts').uploadCandidateResume(new Blob(['%PDF']));
  assert.equal(f.calls.length, 3);
  assert.equal(f.store.getToasts().length, 1);
  assert.equal(f.store.getToasts()[0].message, 'Currículo enviado com sucesso!');
});

test('localização empresarial exige cidade, UF válida e coordenadas finitas', () => {
  const { load } = fixture();
  const { hasCompanyLocation } = load('lib/utils/company-location.ts');
  const valid = { city: 'Campinas', state: 'SP', latitude: -22.9, longitude: -47.06 };
  assert.equal(hasCompanyLocation(valid), true);
  for (const patch of [{ latitude: undefined }, { longitude: NaN }, { latitude: 91 }, { longitude: -181 }, { state: 'UF' }, { city: '' }, { city: 'Localidade' }]) {
    assert.equal(hasCompanyLocation({ ...valid, ...patch }), false);
  }
  assert.equal(hasCompanyLocation({ ...valid, latitude: 0 }), true);
});

test('cadastro e edição enviam latitude e longitude como números', async () => {
  const f = fixture();
  const location = { city: 'Campinas', state: 'SP', latitude: -22.9, longitude: -47.06 };
  await f.load('lib/services/auth.service.ts').registerCompany({ ...location, companyName: 'Empresa de teste' });
  assert.equal(f.calls[0].url.endsWith('/auth/register-company'), true);
  assert.deepEqual(JSON.parse(f.calls[0].options.body), { ...location, companyName: 'Empresa de teste' });
  await f.load('lib/services/company.service.ts').updateCompanyProfileMe(location);
  assert.deepEqual(JSON.parse(f.calls[1].options.body), location);
});
