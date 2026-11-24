import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const [snapshot,abyss,profile,out]=process.argv.slice(2);
if(!out)throw Error("Usage: node scripts/build-universe.mjs SNAPSHOT ABYSS_ROOT PROFILE_ROOT OUTPUT");
const read=p=>fs.readFileSync(p,"utf8"), d=JSON.parse(read(snapshot));
if(d.schema_version!==1||d.scope!=="public-only"||d.owner!=="Neguchads"||!Array.isArray(d.sectors)||d.sectors.length!==4||!/^\d{4}-\d{2}-\d{2}$/.test(d.date))throw Error("Invalid snapshot");
const names=new Set(d.sectors.flatMap(s=>s.projects.map(p=>p.slug)));
if([...names].some(s=>! /^[A-Za-z0-9_.-]{1,100}$/.test(s))||d.featured.some(s=>!names.has(s))||Object.values(d.totals).some(v=>!Number.isSafeInteger(v)||v<0))throw Error("Invalid public data");
fs.mkdirSync(path.join(out,"assets/projects"),{recursive:true});
fs.copyFileSync(path.join(profile,"assets/banner.svg"),path.join(out,"assets/banner.svg"));
for(const slug of d.featured)fs.copyFileSync(path.join(profile,"assets/projects",slug+".svg"),path.join(out,"assets/projects",slug+".svg"));
fs.copyFileSync(path.join(abyss,"index.html"),path.join(out,"abyss.html"));
fs.copyFileSync(path.join(abyss,"LICENSE"),path.join(out,"ABYSS-LICENSE.txt"));
const safe=JSON.stringify(d).replace(/</g,"\\u003c");
const template=read(path.join(root,"docs/universe/template.html"));
const html=template.replace("/*THEME*/",()=>read(path.join(abyss,"integration/universe.css"))).replace("/*DATA*/",()=>safe).replace("/*SCRIPT*/",()=>read(path.join(root,"docs/universe/universe.js")));
fs.writeFileSync(path.join(out,"index.html"),html);
fs.writeFileSync(path.join(out,"snapshot.json"),JSON.stringify(d,null,2)+"\n");
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
for(const pt of [false,true]){
const labels=pt?["Públicos","Originais","Stars","Forks","Seguidores"]:["Public repos","Originals","Stars","Forks","Followers"];
const vals=[d.totals.public_repositories,d.totals.active_originals,d.totals.stars,d.totals.forks,d.totals.followers];
const positions=[[180,125],[780,125],[180,280],[780,280]];
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="960" height="390" viewBox="0 0 960 390" role="img"><title>NAVI Engineering Universe</title><rect x="1" y="1" width="958" height="388" rx="16" fill="#0b111b" stroke="#34516a"/><g font-family="Arial,sans-serif"><text x="25" y="35" fill="#63daff" font-size="15" letter-spacing="2">NEGUCHADS / NAVI ENGINEERING UNIVERSE</text>';
for(let i=0;i<4;i++){const [x,y]=positions[i],s=d.sectors[i];svg+='<path d="M480 202L'+x+' '+y+'" stroke="#34516a" stroke-dasharray="5 4"/><circle cx="'+x+'" cy="'+y+'" r="8" fill="'+esc(s.color)+'"/><text x="'+x+'" y="'+(y-15)+'" text-anchor="middle" fill="#eaf4ff" font-size="15">'+esc(pt?s.pt:s.en)+'</text><text x="'+x+'" y="'+(y+25)+'" text-anchor="middle" fill="#a9c3d9" font-size="13">'+s.projects.length+' '+(pt?"projetos":"projects")+'</text>';}
svg+='<circle cx="480" cy="202" r="60" fill="#122235" stroke="#63daff"/><text x="480" y="198" text-anchor="middle" fill="#eaf4ff" font-size="25" font-weight="bold">NAVI</text><text x="480" y="218" text-anchor="middle" fill="#63daff" font-size="12">3D EXPLORER</text>';
for(let i=0;i<vals.length;i++){const x=105+i*187;svg+='<text x="'+x+'" y="342" text-anchor="middle" font-size="22" fill="#63daff">'+vals[i]+'</text><text x="'+x+'" y="360" text-anchor="middle" font-size="12" fill="#a9c3d9">'+labels[i]+'</text>';}
svg+='<text x="25" y="380" font-size="10" fill="#a9c3d9">'+esc(d.date)+' UTC · '+(pt?"Relações editoriais · métricas públicas":"Curated relationships · public metrics")+'</text></g></svg>\n';
fs.writeFileSync(path.join(out,pt?"universe.pt-BR.svg":"universe.en.svg"),svg);}
