import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { checkMetadata } from '../scripts/check-metadata.mjs';
import { checkClaims } from '../scripts/check-claims.mjs';
import { compareSnapshots } from '../scripts/compare-snapshots.mjs';

test('metadata detects duplicates and boilerplate without claiming an SEO ranking failure', () => {
  const pages=[
    {url:'/hu/',title:'Ügyvédi szolgáltatások',description:'Ügyvédi szolgáltatások a környéken. Tudj meg többet!'},
    {url:'/en/',title:'Ügyvédi szolgáltatások',description:'Ügyvédi szolgáltatások a környéken. Tudj meg többet!'},
    {url:'/about/',title:'Rólunk',description:'Tapasztalt csapatunk bemutatása.'},
  ];
  const output=checkMetadata(pages);
  assert.equal(output.pagesChecked,3);
  assert(output.findings.some(f=>f.id==='DUPLICATE_TITLE'));
  assert(output.findings.some(f=>f.id==='DUPLICATE_DESCRIPTION'));
  assert(output.findings.some(f=>f.id==='GENERIC_CTA_TAIL'));
  assert(output.findings.every(f=>['needs-review','recommendation'].includes(f.status)));
  assert.throws(()=>checkMetadata({url:'/'}),/array/);
  assert.equal(checkMetadata([]).findings.length,0);
});

test('claim checker identifies Hungarian and English candidates, not a fact verdict', () => {
  const uncited=checkClaims('Egy kutatás alapján 47% lett az eredmény, és kétszer gyorsabb.');
  assert(uncited.candidateCount>=2);
  assert(uncited.withoutNearbyCitationSyntax>=2);
  const linked=checkClaims('47% válaszolt. Forrás: https://example.org/study');
  assert.equal(linked.withoutNearbyCitationSyntax,0);
  assert.match(linked.method,/not a fact-check/);
  assert.throws(()=>checkClaims(3),/string/);
  assert.throws(()=>checkClaims('x',{window:20000}),/window/);
});

test('drift compares only observed compatible fields and preserves uncertainty', () => {
  const before={url:'https://example.com/',capturedAt:'2026-10-01T00:00:00Z',surface:'build',title:'Old',canonical:'https://example.com/',noindex:false,h1:['Old']};
  const after={...before,capturedAt:'2026-10-26T00:00:00Z',title:'New',canonical:null,noindex:true,h1:['New'],schemaTypes:[]};
  const result=compareSnapshots(before,after);
  assert.equal(result.comparedFields,4);
  assert(result.notComparable.includes('schemaTypes'));
  assert(result.changes.some(c=>c.field==='canonical'&&c.priority==='investigate-first'));
  assert(result.changes.some(c=>c.field==='noindex'&&c.severity==='high'));
  assert(result.changes.every(c=>c.status==='needs-review'));
  assert.throws(()=>compareSnapshots(before,{...after,surface:'live'}),/surfaces/);
  assert.throws(()=>compareSnapshots(before,{...after,url:'https://different.example/'}),/same URL/);
  assert.throws(()=>compareSnapshots({...before,url:'file:///etc/passwd'},after),/noncanonical/);
});

test('three CLI tools run with no package install or network access', () => {
  const dir=mkdtempSync(join(tmpdir(),'wqt-v11-'));
  const run=(name,...args)=>spawnSync(process.execPath,[resolve('scripts',name),...args],{encoding:'utf8'});
  try {
    const pages=join(dir,'pages.json');
    writeFileSync(pages,JSON.stringify([{url:'/test/',title:'Title',description:'Title'}]));
    const meta=run('check-metadata.mjs',pages);
    assert.equal(meta.status,0,meta.stderr);
    assert.equal(JSON.parse(meta.stdout).pagesChecked,1);

    const text=join(dir,'text.md');
    writeFileSync(text,'A válaszadók 47%-a.');
    const claims=run('check-claims.mjs',text);
    assert.equal(claims.status,0,claims.stderr);
    assert(JSON.parse(claims.stdout).candidateCount>=1);

    const base=join(dir,'baseline.json'), current=join(dir,'current.json');
    const snap={url:'https://example.com/',capturedAt:'2026-10-01T00:00:00Z',surface:'build',title:'Old'};
    writeFileSync(base,JSON.stringify(snap));
    writeFileSync(current,JSON.stringify({...snap,title:'New',capturedAt:'2026-10-26T00:00:00Z'}));
    const drift=run('compare-snapshots.mjs',base,current);
    assert.equal(drift.status,0,drift.stderr);
    assert.equal(JSON.parse(drift.stdout).changes[0].field,'title');

    const invalid=run('compare-snapshots.mjs',base);
    assert.equal(invalid.status,2);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
