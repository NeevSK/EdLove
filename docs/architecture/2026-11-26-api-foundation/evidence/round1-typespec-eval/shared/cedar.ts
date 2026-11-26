// Authorization metadata: every operation names its Cedar action. Tests read it back.
import type { Meta } from '@orpc/contract';
export const cedar = (action: string) => ({ name: 'cedar', init: (meta: Meta) => ({ ...meta, cedarAction: action }) });
