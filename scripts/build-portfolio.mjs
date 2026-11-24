import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const catalog=JSON.parse(read("docs/explore/catalog.json"));
const summaries=JSON.parse(read("docs/explore/public-summaries.json"));
const allowed=new Set(catalog.sectors.flatMap(s=>s.repos.map(r=>r[0])));
if(catalog.schema_version!==1||catalog.owner!=="Neguchads"||catalog.relationship!=="curated-membership"||catalog.sectors.length!==4||allowed.size!==catalog.sectors.reduce((n,s)=>n+s.repos.length,0))throw Error("Unsupported catalog");
const seen=new Set();
for(const m of summaries){
 const expected=["schema_version","scope","repository","commit","nodes","edges","communities","confidence"].sort().join(",");
 if(Object.keys(m).sort().join(",")!==expected||m.schema_version!==1||m.scope!=="public-code-only"||!allowed.has(m.repository)||seen.has(m.repository)||!/^([a-f0-9]{40})$/.test(m.commit)||Object.keys(m.confidence).sort().join(",")!=="EXTRACTED,INFERRED,OTHER"||![m.nodes,m.edges,m.communities,...Object.values(m.confidence)].every(n=>Number.isSafeInteger(n)&&n>=0)||Object.values(m.confidence).reduce((a,b)=>a+b,0)!==m.edges)throw Error("Invalid public summary");
 seen.add(m.repository);
}
const renderSvg=(data,pt) => {
 const esc=x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const count=data.sectors.reduce((n,s)=>n+s.repos.length,0);
 const layout=[[20,100],[500,100],[20,218],[500,218]];
 return '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="355" viewBox="0 0 960 355" role="img" aria-labelledby="t d">\n<title id="t">'+(pt?"Ecossistema de engenharia":"Engineering ecosystem")+'</title><desc id="d">'+(pt?"Mapa editorial dos projetos públicos, não um grafo de dependências extraído.":"Curated public project map, not an extracted dependency graph.")+'</desc>\n<rect x="1" y="1" width="958" height="353" rx="15" fill="#0B111B" stroke="#34516A"/><g font-family="Arial, sans-serif"><text x="24" y="38" fill="#63DAFF" font-size="13" letter-spacing="2">NAVI GRAPHIFY / ENGINEERING UNIVERSE</text><text x="24" y="70" font-size="24" font-weight="bold" fill="#EAF4FF">'+count+' '+(pt?"projetos públicos · 4 setores":"public projects · 4 sectors")+'</text>'+data.sectors.map((s,i)=>{const [x,y]=layout[i];return '<g><rect x="'+x+'" y="'+y+'" width="440" height="100" rx="9" fill="#122235" stroke="#34516A"/><circle cx="'+(x+20)+'" cy="'+(y+23)+'" r="5" fill="'+s.color+'"/><text x="'+(x+34)+'" y="'+(y+28)+'" font-size="18" font-weight="bold" fill="#EAF4FF">'+esc(pt?s.pt:s.en)+'</text><text x="'+(x+18)+'" y="'+(y+54)+'" font-size="14" fill="#A9C3D9">'+s.repos.length+' '+(pt?"projetos":"projects")+'</text><text x="'+(x+18)+'" y="'+(y+76)+'" font-size="12" fill="#C8D7E6">'+esc(s.repos.slice(0,2).map(r=>r[1]).join(" · "))+(s.repos.length>2?" · +"+(s.repos.length-2):"")+'</text></g>'}).join("")+'<path d="M460 150H500M460 268H500M240 200V218M720 200V218" stroke="#00B3FF" stroke-dasharray="4 5" opacity=".7"/><text x="24" y="340" font-size="12" fill="#A9C3D9">'+(pt?"Catálogo público curado · Graphify local · Explore / Build / Verify":"Curated public catalog · local Graphify · Explore / Build / Verify")+'</text></g></svg>\n';
};
const safe=o=>JSON.stringify(o).replace(/</g,"\\u003c");
const name="docs/explore/index.html";
const original=read(name);
const marker=/\/\/ PORTFOLIO_DATA_START[\s\S]*?\/\/ PORTFOLIO_DATA_END/;
if(!marker.test(original))throw Error("Data markers missing");
const outputs={ [name]:original.replace(marker,()=>"// PORTFOLIO_DATA_START\nconst portfolio = "+safe(catalog)+";\nconst summaries = "+safe(summaries)+";\n// PORTFOLIO_DATA_END"),"docs/explore/ecosystem.en.svg":renderSvg(catalog,false),"docs/explore/ecosystem.pt-BR.svg":renderSvg(catalog,true)};
for(const [p,content] of Object.entries(outputs)){if(process.argv.includes("--check")){if(read(p)!==content)throw Error("Stale generated file: "+p)}else fs.writeFileSync(path.join(root,p),content)}
