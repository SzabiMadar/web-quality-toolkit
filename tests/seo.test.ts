import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkSitemap} from '../src/sitemap.ts';
import {checkRobots} from '../src/robots.ts';

test('sitemap missing, valid, duplicate and missing page',async()=>{
 const d=await mkdtemp(join(tmpdir(),'wqt-map-'));
 try{
  const p=join(d,'index.html');await writeFile(p,'<html></html>');
  assert.equal((await checkSitemap(d,'https://example.com/',[p]))[0]?.id,'SITEMAP_MISSING');
  await writeFile(join(d,'sitemap.xml'),'<urlset><url><loc>https://example.com/</loc></url></urlset>');
  assert.deepEqual(await checkSitemap(d,'https://example.com/',[p]),[]);
  await mkdir(join(d,'about'));const a=join(d,'about','index.html');await writeFile(a,'<html></html>');
  const items=await checkSitemap(d,'https://example.com/',[p,a]);
  assert.ok(items.some(f=>f.id==='SITEMAP_PAGE_MISSING'));
  await writeFile(join(d,'sitemap.xml'),'<urlset><url><loc>https://example.com/</loc></url><url><loc>https://example.com/</loc></url></urlset>');
  assert.ok((await checkSitemap(d,'https://example.com/',[p])) .some(f=>f.id==='SITEMAP_DUPLICATE'));
 } finally {await rm(d,{recursive:true,force:true});}
});
test('robots missing, valid and wildcard blocking',async()=>{
 const d=await mkdtemp(join(tmpdir(),'wqt-robots-'));
 try{
  assert.equal((await checkRobots(d,'https://example.com/'))[0]?.id,'ROBOTS_MISSING');
  await writeFile(join(d,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml');
  assert.deepEqual(await checkRobots(d,'https://example.com/'),[]);
  await writeFile(join(d,'robots.txt'),'User-agent: *\nDisallow: /\nSitemap: https://other.com/sitemap.xml');
  const result=await checkRobots(d,'https://example.com/');
  assert.ok(result.some(f=>f.id==='ROBOTS_BLOCK_ALL'));
  assert.ok(result.some(f=>f.id==='ROBOTS_SITEMAP_ORIGIN'));
 }finally{await rm(d,{recursive:true,force:true});}
});

test('Astro sitemap index loads child sitemap and validates listed pages',async()=>{
 const d=await mkdtemp(join(tmpdir(),'wqt-index-'));
 try {
  const page=join(d,'index.html');await writeFile(page,'<html></html>');
  await writeFile(join(d,'sitemap-index.xml'),'<sitemapindex><sitemap><loc>https://example.com/sitemap-0.xml</loc></sitemap></sitemapindex>');
  await writeFile(join(d,'sitemap-0.xml'),'<urlset><url><loc>https://example.com/</loc></url></urlset>');
  assert.deepEqual(await checkSitemap(d,'https://example.com/',[page]),[]);
  await rm(join(d,'sitemap-0.xml'));
  assert.equal((await checkSitemap(d,'https://example.com/',[page]))[0]?.id,'SITEMAP_CHILD_MISSING');
 } finally{await rm(d,{recursive:true,force:true});}
});
