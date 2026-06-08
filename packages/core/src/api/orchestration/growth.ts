import { growthContract } from '../growth.contract';
import { growthSignalsAPI } from '../growthSignals';
import { impactRipplesAPI } from '../impactRipples';
import { createPOAProxy } from '../poaProxy';
import { proContract } from '../pro.contract';
import { sacredMissionsAPI } from '../sacredMissions';
import { thuthimalAPI } from '../thuthimal';
import { userGrowthStateAPI } from '../userGrowthState';

export const growthAPI = createPOAProxy('growth', growthSignalsAPI, growthContract);
export const proAPI = createPOAProxy('pro', thuthimalAPI, proContract);
export const missionsAPI = createPOAProxy('missions', sacredMissionsAPI, growthContract);
export const ripplesAPI = createPOAProxy('ripples', impactRipplesAPI, growthContract);
export const growthStateAPI = createPOAProxy('growthState', userGrowthStateAPI, growthContract);
