import fs from 'node:fs';
import { run } from './tools/controller.mjs';
const evidence = run(['status','work.json','state.json']).sources.map(({id,sha256})=>({sourceId:id,sha256}));
const summaries = {
context: 'Read all four frozen sources. Router and capability manifest describe implemented foundation procedures; catalog and policy retain older reset descriptions. Policy explicitly separates resumed horizontal engineering from deferred business admission.',
analysis: 'Current router and manifest agree on six admitted app/session foundation capabilities: identity.session, identity.scopes, identity.entry, identity.createInitialBond, identity.syncCredentials and authority.refreshSnapshot. The first four identity reads plus syncCredentials are not all read-only: createInitialBond and refreshSnapshot are commands. Empty whole-contract wording is stale; empty business-contract wording remains consistent with foundation-only scope. Neither code admission nor earlier reset language authorizes business procedures.',
verification: 'Compared every shown router handler with all six manifest entries: matching names, four queries and two commands. All manifest entries require G2, but no G2 execution results or deployed runtime observations were supplied. Verified middleware rejects missing identity/platform and syncCredentials reports SERVICE_UNAVAILABLE when issuer absent. Controller confirms evidence freshness and ordered records only.',
reconciliation: 'Review catalog-description line 4 for obsolete empty-v1 claim and foundation-policy lines 34-35 for obsolete two-read-only-procedure count. Preserve catalog business-empty invariant and governing business-admission deferral. Required G2 remains configured with owner confirmation outstanding in capabilities comment; establish actual evidence and confirmation before treating foundation as verified. No business implementation authorization follows.'
};
for (const stage of ['context','analysis','verification','reconciliation']) {
 const action={id:`${stage}-1`,kind:'record',stage,summary:summaries[stage],evidence,unresolved:[]};
 fs.writeFileSync(`${stage}.action.json`,JSON.stringify(action,null,2));
 const result=run(['record','work.json','state.json',`${stage}.action.json`]);
 console.log(JSON.stringify({stage,completed:result.completed,invalidated:result.invalidated,nextAction:result.nextAction}));
}
