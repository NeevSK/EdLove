import { mkdtempSync, rmSync } from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { dimensionNames } from '../../../packages/platform-mcp/src/lifecycle/model.js';
import { executeLifecycleRequest } from '../../../packages/platform-mcp/src/lifecycle/runtime.js';
const root=path.resolve(process.cwd(),'../..'), dir=mkdtempSync(path.join(os.tmpdir(),'lifecycle-real-check-')), databasePath=path.join(dir,'state.sqlite'), id='real-pjc-check', source='docs/architecture/model/gurudevi.c4'; let rev=0, n=0;
async function call(payload){const result=await executeLifecycleRequest({...payload,id,operationId:`op-${n++}`,expectedRevision:rev},{root,databasePath}); rev=result.state.revision; return result;}
try {
const actors=[{id:'product',roles:['product']},{id:'verifier',roles:['verification']}];
await call({action:'create',goal:'Exercise the lifecycle graph with the real PJC check.',scope:'feature',actors,sourcePaths:[source],externalRefs:[]});
const dimensions=Object.fromEntries(dimensionNames.map(name=>[name,{applicability:name==='ux'?'applies':'not-applicable',reason:'Bounded integration fixture.',sources:[source]}]));
await call({action:'publish',artifact:{id:'analysis',scope:'fixture',authorId:'product',sourcePaths:[source],dependsOn:[],content:{kind:'analysis',requestKind:'feature',dimensions,reuse:[],openQuestions:[]}}});
await call({action:'plan',analysisRef:{id:'analysis',version:1}});
await call({action:'tool-decision',taskId:'product',toolId:'pjc-check',actorId:'product',decision:'tool',evidence:[]});
const result=await call({action:'run-tool',taskId:'product',toolId:'pjc-check',actorId:'product'});
const run=result.state.toolRuns.at(-1); const report=JSON.parse(run.result?.stdout ?? '{}'); console.log(JSON.stringify({trace:result.graphTrace,tool:run.toolId,runState:run.state,ok:run.result?.ok,exitCode:run.result?.exitCode,pjcErrors:report.errors?.length,pjcGaps:report.gaps?.length,readiness:result.projection.readiness}));
} finally { rmSync(dir,{recursive:true,force:true}); }


