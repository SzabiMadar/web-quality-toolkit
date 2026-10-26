import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Finding } from './types.ts';
const finding=(id:string,message:string,evidence?:Record<string,string|number>):Finding=>({id,category:'robots',severity:'medium',status:'confirmed',file:'robots.txt',message,evidence});
export async function checkRobots(directory:string,siteUrl:string):Promise<Finding[]> {
  let body:string;
  try {body=await readFile(join(directory,'robots.txt'),'utf8');}
  catch{return [finding('ROBOTS_MISSING','robots.txt was not found in the build output (advisory; robots.txt is optional)')];}
  const findings:Finding[]=[];
  const lines=body.split(/\r?\n/).map(l=>l.replace(/#.*$/,'').trim()).filter(Boolean);
  let group:string[]=[];
  let disallowAll=false;
  const sitemaps:string[]=[];
  for(const line of lines){
    const idx=line.indexOf(':');if(idx<0)continue;
    const name=line.slice(0,idx).trim().toLowerCase(), value=line.slice(idx+1).trim();
    if(name==='user-agent'){group.push(value.toLowerCase());continue;}
    if(name==='sitemap')sitemaps.push(value);
    if(name==='disallow'&&value==='/'&&group.includes('*'))disallowAll=true;
    if(name==='allow'||name==='disallow'||name==='crawl-delay')continue;
  }
  if(disallowAll)findings.push(finding('ROBOTS_BLOCK_ALL','A User-agent: * group contains Disallow: /; check whether this production policy is intentional'));
  const origin=new URL(siteUrl).origin;
  for(const url of sitemaps){try{const u=new URL(url);if(!['http:','https:'].includes(u.protocol)||u.origin!==origin)findings.push(finding('ROBOTS_SITEMAP_ORIGIN','Sitemap directive points outside the configured site',{url}));}catch{findings.push(finding('ROBOTS_INVALID_SITEMAP','Sitemap directive must be an absolute URL',{url}));}}
  return findings;
}
