import {readFileSync} from 'node:fs';
const file=process.argv[2];
if(!file){console.error('Usage: node scripts/summarize-audit.mjs <npm-audit.json>');process.exit(1);}
let report;
try{report=JSON.parse(readFileSync(file,'utf8'));}catch(error){console.error('Could not parse npm audit JSON:',error.message);process.exit(1);}
const vulnerabilities=report.vulnerabilities;
if(!vulnerabilities||typeof vulnerabilities!=='object'){
 console.log('## Dependency security audit\n\nNo usable vulnerability report was returned. Check npm registry connectivity and workflow logs.');
 process.exitCode=1;
}else{
 const totals=report.metadata?.vulnerabilities||{};
 console.log('## Dependency security audit\n');
 console.log('Locked dependencies; generated with npm audit.\n');
 console.log('| Severity | Count |\n| --- | ---: |');
 for(const severity of ['critical','high','moderate','low','info'])console.log('| '+severity+' | '+(totals[severity]??0)+' |');
 console.log('\n| Package | Severity | Direct dependency | Fix available |\n| --- | --- | --- | --- |');
 const entries=Object.entries(vulnerabilities).sort(([a],[b])=>a.localeCompare(b));
 if(!entries.length)console.log('| None | — | — | — |');
 for(const [name,issue] of entries){
  const safe=(s)=>String(s).replace(/\\|/g,'\\\\|').replace(/[\r\n]/g,' ');
  const fix=issue.fixAvailable===false?'No':typeof issue.fixAvailable==='object'?'Requires '+safe(issue.fixAvailable.name)+'@'+safe(issue.fixAvailable.version):'Yes';
  console.log('| '+safe(name)+' | '+safe(issue.severity)+' | '+(issue.isDirect?'Yes':'No')+' | '+fix+' |');
 }
 console.log('\n**Note:** This is a report, not a guarantee of safety. Investigate advisory details and update dependencies in a separate tested PR.');
}
