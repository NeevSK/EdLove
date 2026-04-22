import {
  createWorkspaceRendererConfig,
  resolveWorkspaceRendererPlatform,
} from '../../logic/workspace/renderer';

describe('workspace renderer resolution', () => {
  test('web browser can collapse into tablet and mobile renderers by width', () => {
    expect(resolveWorkspaceRendererPlatform({ runtimePlatform: 'web', width: 1440 })).toBe('web');
    expect(resolveWorkspaceRendererPlatform({ runtimePlatform: 'web', width: 1024 })).toBe(
      'tablet',
    );
    expect(resolveWorkspaceRendererPlatform({ runtimePlatform: 'web', width: 480 })).toBe('mobile');
  });

  test('native platforms stay in mobile or tablet lanes', () => {
    expect(resolveWorkspaceRendererPlatform({ runtimePlatform: 'android', width: 430 })).toBe(
      'mobile',
    );
    expect(resolveWorkspaceRendererPlatform({ runtimePlatform: 'ios', width: 1024 })).toBe(
      'tablet',
    );
  });

  test('renderer config provides runtime and mode defaults', () => {
    expect(
      createWorkspaceRendererConfig({
        runtimePlatform: 'web',
        width: 1100,
      }),
    ).toEqual({
      runtimePlatform: 'web',
      platform: 'tablet',
      mode: 'grid',
      maxColumns: 2,
    });
  });
});
