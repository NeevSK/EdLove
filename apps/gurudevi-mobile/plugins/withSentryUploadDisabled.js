const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withSentryUploadDisabled(config) {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const propsPath = path.join(
                config.modRequest.platformProjectRoot,
                'sentry.properties'
            );

            console.log('\n╔══════════════════════════════════════════════╗');
            console.log('║     withSentryUploadDisabled plugin running   ║');
            console.log('╚══════════════════════════════════════════════╝');
            console.log(`📍 sentry.properties path: ${propsPath}`);

            // ── Read existing file ──────────────────────────────────────
            let contents = '';
            if (fs.existsSync(propsPath)) {
                contents = fs.readFileSync(propsPath, 'utf8');
                console.log('\n📄 BEFORE — sentry.properties contents:');
                console.log('─'.repeat(50));
                console.log(contents || '(empty)');
                console.log('─'.repeat(50));

                // Warn if a conflicting upload=true exists
                if (contents.includes('defaults.upload=true')) {
                    console.warn('⚠️  Found defaults.upload=true — will override to false');
                }
                if (contents.includes('auth.token')) {
                    console.log('ℹ️  Auth token line present in file (will be preserved)');
                } else {
                    console.log('ℹ️  No auth.token line found — Sentry upload would fail anyway');
                }
            } else {
                console.log('⚠️  sentry.properties does NOT exist yet at this path');
                console.log('   This is okay — we will create it');
            }

            // ── Patch: remove any existing upload line, append ours ────
            const lines = contents.split('\n').filter(line => !line.startsWith('defaults.upload'));
            const removedCount = contents.split('\n').length - lines.length;
            if (removedCount > 0) {
                console.log(`\n✂️  Removed ${removedCount} existing defaults.upload line(s)`);
            }
            lines.push('defaults.upload=false');
            const patched = lines.join('\n') + '\n';

            fs.writeFileSync(propsPath, patched);

            // ── Verify write ────────────────────────────────────────────
            const written = fs.readFileSync(propsPath, 'utf8');
            console.log('\n📄 AFTER — sentry.properties contents:');
            console.log('─'.repeat(50));
            console.log(written);
            console.log('─'.repeat(50));

            if (written.includes('defaults.upload=false')) {
                console.log('✅ defaults.upload=false confirmed in file');
            } else {
                console.error('❌ CRITICAL: defaults.upload=false NOT found after write — something went wrong');
                // Don't throw — let build continue, but the warning is loud
            }

            console.log('╔══════════════════════════════════════════════╗');
            console.log('║     withSentryUploadDisabled plugin done      ║');
            console.log('╚══════════════════════════════════════════════╝\n');

            return config;
        },
    ]);
};
