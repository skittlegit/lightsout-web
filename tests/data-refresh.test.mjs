import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const root = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");

function loadApi(env = {}, fetcher = async () => { throw new Error("offline"); }) {
  const modules = new Map();
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ["2026-10-02T12:00:00Z"])); }
  }
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    const loadedModule = { exports: {} };
    modules.set(filename, loadedModule);
    const code = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const context = { module: loadedModule, exports: loadedModule.exports, process: { env }, Date: FixedDate,
      fetch: fetcher, AbortSignal, console: { warn() {} },
      require(specifier) {
        if (!specifier.startsWith(".")) return nativeRequire(specifier);
        const path = resolve(dirname(filename), specifier);
        return path.endsWith(".json") ? JSON.parse(readFileSync(path, "utf8")) : load(`${path}.ts`);
      },
    };
    vm.runInNewContext(code, context, { filename });
    return loadedModule.exports;
  }
  return load(resolve(root, "lib/api.ts"));
}

test("default and previous Railway URL resolve to Render, adding /api when missing", () => {
  for (const url of [undefined, "https://lightsout-api.up.railway.app", "https://lightsout-api.up.railway.app/api/", "https://lightsout-api.onrender.com"]) {
    const api = loadApi(url ? { NEXT_PUBLIC_API_URL: url } : {});
    assert.equal(api.backendUrl("/calendar"), "https://lightsout-api.onrender.com/api/calendar?season=2026");
  }
});

test("offline calendar recomputes next race from all 23 scheduled rounds", async () => {
  const api = loadApi();
  const calendar = await api.getCalendar();
  assert.equal(calendar.races.length, 23);
  assert.equal(api.pickNextRace(calendar.races).round, 16);
  assert.equal(calendar.races.find((race) => race.round === 4).is_completed, true);
});

test("unavailable forecast uses the calendar's next race instead of Miami", async () => {
  const prediction = await loadApi().getNextPrediction();
  assert.equal(prediction.round, 16);
  assert.equal(prediction.status, "model_unavailable");
  assert.equal(prediction.pre_quali, null);
});

test("forecasts bypass Vercel cache so a Render model reload is visible", async () => {
  let options;
  const api = loadApi({}, async (_url, requestOptions) => {
    options = requestOptions;
    return { ok: true, json: async () => ({ round: 16, status: "ok" }) };
  });
  await api.getNextPrediction();
  assert.equal(options.cache, "no-store");
  assert.equal(options.next, undefined);
  await api.getPrediction(16);
  assert.equal(options.cache, "no-store");
});

test("Next.js dynamic rendering signals are rethrown rather than shown as forecast failures", async () => {
  const error = Object.assign(new Error("dynamic rendering"), { digest: "DYNAMIC_SERVER_USAGE" });
  const api = loadApi({}, async () => { throw error; });
  await assert.rejects(api.getNextPrediction(), (caught) => caught === error);
});

test("live Jolpica calendar is used when backend fails", async () => {
  const api = loadApi({}, async (url) => {
    if (url.includes("onrender.com")) return { ok: false, status: 503 };
    return { ok: true, json: async () => ({ MRData: { RaceTable: { Races: [{
      season: "2026", round: "17", raceName: "Singapore Grand Prix", date: "2026-10-11",
      Circuit: { circuitName: "Marina Bay Street Circuit", Location: { country: "Singapore" } }, Sprint: {},
    }] } } }) };
  });
  const calendar = await api.getCalendar();
  assert.equal(calendar.races.length, 1);
  assert.equal(calendar.races[0].round, 17);
  assert.equal(calendar.races[0].has_sprint, true);
});

test("completed season has no next race and another season cannot reuse 2026 snapshot", async () => {
  const api = loadApi({ NEXT_PUBLIC_SEASON: "2027" });
  assert.equal((await api.getCalendar()).races.length, 0);
  assert.equal(api.pickNextRace([{ is_completed: true, is_next: false }]), null);
});
