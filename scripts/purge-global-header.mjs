import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function updateFile(relPath, transformFn) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skip non-existent: ${relPath}`);
    return;
  }
  const original = fs.readFileSync(fullPath, 'utf8');
  const updated = transformFn(original);
  if (original !== updated) {
    const tmp = `${fullPath}.tmp`;
    fs.writeFileSync(tmp, updated, 'utf8');
    const winTmp = tmp.replace(/\//g, '\\');
    const winTarget = fullPath.replace(/\//g, '\\');
    execSync(`cmd.exe /c move /y "${winTmp}" "${winTarget}"`);
    console.log(`Updated: ${relPath}`);
  } else {
    console.log(`Unchanged: ${relPath}`);
  }
}

// 1. apps/gurudevi-mobile/app/(tabs)/_layout.tsx
updateFile('apps/gurudevi-mobile/app/(tabs)/_layout.tsx', (content) => {
  return content
    .replace("import GlobalHeader from '@repo/ui/components/GlobalHeader';\n", '')
    .replace(
      `<GlobalHeader
            title={isWorkspace ? undefined : title}
            subtitle={shell.header.subtitleVisible && !isWorkspace ? displayName : undefined}
            perspectivePill={
              isWorkspace
                ? {
                    label: perspectiveLabel,
                    kind: perspectiveKind,
                    onPress: () => setPerspectiveSwitcherOpen(true),
                  }
                : undefined
            }
            extraActions={globalHeaderActions}
          onNotificationsPress={() => router.push('/notifications')}
          />`,
      `<AppHeader
            title={isWorkspace ? undefined : title}
            eyebrow={shell.header.subtitleVisible && !isWorkspace ? displayName : undefined}
            actions={globalHeaderActions}
          />`
    );
});

// 2. packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx
updateFile('packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx', (content) => {
  return content
    .replace("import GlobalHeader from '@repo/ui/components/GlobalHeader';", "import { AppHeader } from '@repo/ui/components/native';")
    .replace(
      '<GlobalHeader title={title} subtitle={subtitle} />',
      '<AppHeader title={title} eyebrow={subtitle} />'
    );
});

// 3. packages/admin/src/screens/AnalyticsDashboardScreen.tsx
updateFile('packages/admin/src/screens/AnalyticsDashboardScreen.tsx', (content) => {
  return content
    .replace("import GlobalHeader from '@repo/ui/components/GlobalHeader';", "import { AppHeader } from '@repo/ui/components/native';")
    .replace(
      '<GlobalHeader title="Analytics" subtitle={tenantName} />',
      '<AppHeader title="Analytics" eyebrow={tenantName} />'
    );
});

// 4. packages/classroom/src/components/ClassroomAccessState.tsx
updateFile('packages/classroom/src/components/ClassroomAccessState.tsx', (content) => {
  return content
    .replace("import GlobalHeader from '@repo/ui/components/GlobalHeader';", "import { AppHeader } from '@repo/ui/components/native';")
    .replace(
      `<GlobalHeader
        title={missing ? 'Choose a classroom' : 'Classroom unavailable'}
        showBack
        onBack={onBack}
      />`,
      `<AppHeader
        title={missing ? 'Choose a classroom' : 'Classroom unavailable'}
        onBack={onBack}
      />`
    );
});

// 5. packages/community/src/screens/BaseChatScreen.tsx
updateFile('packages/community/src/screens/BaseChatScreen.tsx', (content) => {
  return content
    .replace("import GlobalHeader from '@repo/ui/components/GlobalHeader';", "import { AppHeader } from '@repo/ui/components/native';")
    .replace(
      `<GlobalHeader
        title={props.title}
        subtitle={props.subtitle}
        showBack
        rightAction={props.headerRight}
      />`,
      `<AppHeader
        title={props.title}
        eyebrow={props.subtitle}
      />`
    );
});

// 6. packages/library/src/screens/PDFViewerScreen.web.tsx
updateFile('packages/library/src/screens/PDFViewerScreen.web.tsx', (content) => {
  return content
    .replace("import GlobalHeader from '@repo/ui/components/GlobalHeader';\n", '')
    .replace(
      `<GlobalHeader
        title={title}
        subtitle="Document Viewer"
        showBack
        onBack={() => safeBack('/library')}
        rightAction={
          <button
            type="button"
            onClick={() => setIsBookmarked((b) => !b)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
            style={{
              background: isBookmarked ? \`\${theme.accent.action}22\` : 'transparent',
              border: 'none',
              borderRadius: '9999px',
              padding: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bookmark size={18} color={isBookmarked ? theme.accent.action : theme.text.secondary} />
          </button>
        }
      />`,
      `<header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div>
          <button type="button" onClick={() => safeBack('/library')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 12 }}>←</button>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{title || 'Document Viewer'}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsBookmarked((b) => !b)}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
          style={{
            background: isBookmarked ? \`\${theme.accent.action}22\` : 'transparent',
            border: 'none',
            borderRadius: '9999px',
            padding: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bookmark size={18} color={isBookmarked ? theme.accent.action : theme.text.secondary} />
        </button>
      </header>`
    );
});

// 7. packages/self/src/components/BaseSelfView.tsx
updateFile('packages/self/src/components/BaseSelfView.tsx', (content) => {
  return content
    .replace("import GlobalHeader from '@repo/ui/components/GlobalHeader';", "import { AppHeader } from '@repo/ui/components/native';")
    .replace(
      `<GlobalHeader isSelfView={true} subtitle={perspective.toUpperCase()} title="Sadhana" />`,
      `<AppHeader eyebrow={perspective.toUpperCase()} title="Sadhana" />`
    );
});

// 8. packages/self/src/screens/SelfScreen.unified.tsx
updateFile('packages/self/src/screens/SelfScreen.unified.tsx', (content) => {
  return content
    .replace("import GlobalHeader from '@repo/ui/components/GlobalHeader';", "import { AppHeader } from '@repo/ui/components/native';")
    .replace(
      `<GlobalHeader title="Sadhana" subtitle={getSubtitle(roles)} />`,
      `<AppHeader title="Sadhana" eyebrow={getSubtitle(roles)} />`
    );
});
