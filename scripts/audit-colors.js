const fs = require('node:fs');
const { getContrastRatio } = require('./packages/ui/src/utils/colorUtils');
const { phaseMatrix } = require('./packages/ui/src/theme/Theme');

const phases = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
const modes = ['light', 'dark'];
const AA_THRESHOLD = 4.5;

const results = {
  summary: { totalViolations: 0 },
  violations: [],
};

phases.forEach((phase) => {
  modes.forEach((mode) => {
    const tokens = phaseMatrix[phase][mode];
    const accent = tokens.accent.action;
    const reward = tokens.accent.reward;
    const bg0 = tokens.gradientNodes[0];
    const primaryText = tokens.text.primary;
    const inverseText = tokens.text.inverse;

    // Helper to check and record
    const check = (type, bg, fg) => {
      const ratio = getContrastRatio(fg, bg);
      if (ratio < AA_THRESHOLD) {
        results.violations.push({
          phase,
          mode,
          type,
          bg,
          fg,
          ratio: ratio.toFixed(2),
        });
        results.summary.totalViolations++;
      }
    };

    check('Action (Accent)', accent, inverseText);
    check('Reward', reward, inverseText);
    check('Surface Text', bg0, primaryText);
  });
});

fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
console.log(`Audit complete. Found ${results.summary.totalViolations} violations.`);
