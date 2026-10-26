import { readFile } from 'node:fs/promises';
import { join, relative, sep, basename } from 'node:path';
import type { Finding } from './types.ts';
import { expectedUrl } from './canonical.ts';

const finding = (id: string, file: string, message: string, evidence?: Record<string,string|number>): Finding => ({id, category:'sitemap', severity:'medium',status:'confirmed',file,message,evidence});
const decode = (v:string):string => v.replace(/&(?:amp|lt|gt|quot|apos);/g, x=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"} as Record<string,string>)[x]!);
export async function checkSitemap(directory:string, siteUrl:string, pages:string[]):Promise<Finding[]> {
  const base = new URL(siteUrl);
  const file = join(directory,'sitemap-index.xml');
  const primary = join(directory,'sitemap.xml');
  let xml:string, relativeFile='sitemap.xml';
  try { xml=await readFile(primary,'utf8'); }
  catch { try { xml=await readFile(file,'utf8');relativeFile='sitemap-index.xml'; } catch { return [finding('SITEMAP_MISSING','sitemap.xml','No sitemap.xml or sitemap-index.xml found in build output')]; } }
  const results:Finding[]=[];
  if (!/<(?:\w+:)?(?:urlset|sitemapindex)\b/i.test(xml)) results.push(finding('SITEMAP_INVALID_ROOT',relativeFile,'Not a recognized sitemap XML document'));
  const locs=[...xml.matchAll(/<(?:\w+:)?loc\b[^>]*>([\s\S]*?)<\/(?:\w+:)?loc>/gi)].map(m=>decode(m[1]!.trim()));
  if(!locs.length) results.push(finding('SITEMAP_NO_URLS',relativeFile,'No loc elements found'));
  const indexed=/<(?:\w+:)?sitemapindex\b/i.test(xml);
  const urls=new Set<string>();
  for(const loc of locs){
    let url:URL;
    try {url=new URL(loc);if(!['http:','https:'].includes(url.protocol))throw Error('protocol');}
    catch {results.push(finding('SITEMAP_INVALID_URL',relativeFile,'Invalid absolute URL in sitemap',{url:loc}));continue;}
    if(url.origin!==base.origin)results.push(finding('SITEMAP_OTHER_ORIGIN',relativeFile,'Sitemap URL uses a different origin',{url:loc}));
    if(urls.has(url.href))results.push(finding('SITEMAP_DUPLICATE',relativeFile,'Duplicate sitemap URL',{url:url.href}));
    urls.add(url.href);
  }
  if(indexed){
    const pageUrls:string[]=[];
    for(const child of locs){
      let url:URL;
      try{url=new URL(child);}catch{continue;}
      // Local build sitemap files only: never fetch remote URLs or traverse folders.
      const filename=decodeURIComponent(url.pathname.split('/').at(-1)??'');
      if(url.origin!==base.origin || !/^sitemap(?:-[0-9]+)?\.xml$/.test(filename) || filename!==basename(filename)){
        results.push(finding('SITEMAP_CHILD_UNSUPPORTED',relativeFile,'Cannot inspect referenced sitemap locally',{url:child}));
        continue;
      }
      let childXml:string;
      try{childXml=await readFile(join(directory,filename),'utf8');}
      catch{results.push(finding('SITEMAP_CHILD_MISSING',filename,'Referenced sitemap file absent from local build'));continue;}
      if(!/<(?:\w+:)?urlset\b/i.test(childXml))results.push(finding('SITEMAP_CHILD_INVALID',filename,'Referenced sitemap has no urlset root'));
      for(const m of childXml.matchAll(/<(?:\w+:)?loc\b[^>]*>([\s\S]*?)<\/(?:\w+:)?loc>/gi))pageUrls.push(decode(m[1]!.trim()));
    }
    if(results.some(r=>r.id.startsWith('SITEMAP_CHILD_')))return results;
    urls.clear();
    for(const pageUrl of pageUrls){
      let u:URL;
      try{u=new URL(pageUrl);if(!['http:','https:'].includes(u.protocol))throw Error('protocol');}
      catch{results.push(finding('SITEMAP_INVALID_URL',relativeFile,'Invalid URL in child sitemap',{url:pageUrl}));continue;}
      if(u.origin!==base.origin)results.push(finding('SITEMAP_OTHER_ORIGIN',relativeFile,'Child sitemap URL uses another origin',{url:pageUrl}));
      if(urls.has(u.href))results.push(finding('SITEMAP_DUPLICATE',relativeFile,'Duplicate page URL across child sitemaps',{url:u.href}));
      urls.add(u.href);
    }
  }
  const expected=new Map(pages.map(p=>[expectedUrl(p,directory,siteUrl),relative(directory,p).split(sep).join('/')]));
  for(const [url,path] of expected) if(!urls.has(url)) results.push(finding('SITEMAP_PAGE_MISSING',relativeFile,'Built HTML page not listed in sitemap',{url,htmlFile:path}));
  for(const url of urls) if(url.startsWith(base.origin+'/')&&!expected.has(url))results.push(finding('SITEMAP_EXTRA_URL',relativeFile,'Sitemap URL does not match a built HTML page',{url}));
  return results;
}
