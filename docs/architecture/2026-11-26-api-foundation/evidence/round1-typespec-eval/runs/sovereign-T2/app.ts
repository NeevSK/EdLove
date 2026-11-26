import { contract } from './contract';
import { handlers } from './handlers';
import { cedarActionOfContract, createHandler } from './runtime';

export const handle = createHandler(contract, handlers);
export const cedarActionOf = (operationId: string) => cedarActionOfContract(contract, operationId);
