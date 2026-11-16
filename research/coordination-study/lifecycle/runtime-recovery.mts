import assert from 'node:assert/strict';
import { executeLifecycleRequest } from '../../../packages/platform-mcp/src/lifecycle/runtime.js';
import { createLifecycleFixture, createRequest, analysisArtifact } from '../../../packages/platform-mcp/src/lifecycle/fixtures.js';
const f=createLifecycleFixture(); const id='retry-proof'; let revision=0;
async function action(payload){const r=await executeLifecycleRequest({...payload,id,operationId:`op-${revision}`,expectedRevision:revision},{root:f.root,databasePath:f.databasePath,procedureRevision:'test-v1',runCheck:()=>({ok:true,stdout:'pass',stderr:'',exitCode:0})}); revision=r.state.revision; return r;}
try {
 await executeLifecycleRequest(createRequest(f,id),{root:f.root,databasePath:f.databasePath,procedureRevision:'test-v1'}); revision=0;
 await action({action:'publish',artifact:analysisArtifact(f.sourcePaths[0])});
 await action({action:'plan',analysisRef:{id:'analysis',version:1}});
 await action({action:'tool-decision',taskId:'product',toolId:'pjc-check',actorId:'product-agent',decision:'tool',evidence:[]});
 let calls=0; const req={action:'run-tool',id,operationId:`op-${revision}`,expectedRevision:revision,taskId:'product',toolId:'pjc-check',actorId:'product-agent'};
 try { await executeLifecycleRequest(req,{root:f.root,databasePath:f.databasePath,procedureRevision:'test-v1',runCheck:()=>{calls++; throw new Error('simulated process interruption');}}); } catch {}
 assert.equal(calls,1);
 const retry=await executeLifecycleRequest(req,{root:f.root,databasePath:f.databasePath,procedureRevision:'test-v1',runCheck:()=>{calls++; return {ok:true,stdout:'pass',stderr:'',exitCode:0};}});
 assert.equal(calls,1); assert.equal(retry.duplicate,true); assert.equal(retry.state.toolRuns.at(-1)?.state,'pending');
 console.log(JSON.stringify({calls,duplicateRetry:retry.duplicate,runState:retry.state.toolRuns.at(-1)?.state,revision:retry.state.revision}));
} finally { f.dispose(); }
