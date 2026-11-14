import { FLOW_REGISTRY, type FlowId, inspectJourneyPilot } from '../packages/core/src/flows/index';

const flowId = process.argv[2];
if (!flowId || !Object.hasOwn(FLOW_REGISTRY, flowId)) {
  console.error('Provide a registered flow ID, for example flow:principal:connect_school.');
  process.exitCode = 2;
} else {
  const report = inspectJourneyPilot(flowId as FlowId);
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
}
