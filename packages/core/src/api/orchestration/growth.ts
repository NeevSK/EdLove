import { growthSignalsAPI } from '../growthSignals';
import { thuthimalAPI } from '../thuthimal';
import { sacredMissionsAPI } from '../sacredMissions';
import { impactRipplesAPI } from '../impactRipples';
import { userGrowthStateAPI } from '../userGrowthState';
import { growthContract } from '../growth.contract';
import { proContract } from '../pro.contract';
import { createPOAProxy } from '../poaProxy';

export const growthAPI = createPOAProxy('growth', growthSignalsAPI, growthContract);
export const proAPI = createPOAProxy('pro', thuthimalAPI, proContract);
export const missionsAPI = createPOAProxy('missions', sacredMissionsAPI, growthContract);
export const ripplesAPI = createPOAProxy('ripples', impactRipplesAPI, growthContract);
export const growthStateAPI = createPOAProxy('growthState', userGrowthStateAPI, growthContract);
