import { lifecycleRequestSchema } from '../../../packages/platform-mcp/src/lifecycle/model.js';
const a=lifecycleRequestSchema.parse({action:'create',id:'x',operationId:'o',expectedRevision:0,goal:'g',scope:'feature',actors:[{id:'a',roles:['product']}],sourcePaths:['s'],externalRefs:[]});
const b=lifecycleRequestSchema.parse({externalRefs:[],sourcePaths:['s'],actors:[{roles:['product'],id:'a'}],scope:'feature',goal:'g',expectedRevision:0,operationId:'o',id:'x',action:'create'});
console.log(JSON.stringify(a)===JSON.stringify(b),JSON.stringify(a),JSON.stringify(b));
