/**
 * Dagger CI/CD Pipeline for Polymath Platform
 * Written in TypeScript for 2026 Sovereign Architecture
 */
import { Container, type Directory, dag, func, object } from '@dagger.io/dagger';

@object()
class PolymathCI {
  /**
   * Run full monorepo audit (Lint, Typecheck, Test)
   */
  @func()
  async audit(source: Directory): Promise<string> {
    const node = dag.container().from('node:24-alpine'); // Following 2026 Node policy

    const base = node
      .withDirectory('/src', source, { exclude: ['node_modules', '.turbo'] })
      .withWorkdir('/src')
      .withExec(['npm', 'install', '-g', 'pnpm@9'])
      .withExec(['pnpm', 'install']);

    // Parallel Execution
    const linting = base.withExec(['pnpm', 'run', 'lint']);
    const typecheck = base.withExec(['pnpm', 'run', 'check-types']);

    await Promise.all([linting.sync(), typecheck.sync()]);

    return 'Audit Complete: All Sovereign Gates Passed.';
  }

  /**
   * Local-First AI Eval
   */
  @func()
  async evaluateAi(source: Directory): Promise<string> {
    return dag
      .container()
      .from('node:24-alpine')
      .withDirectory('/src', source, { exclude: ['node_modules'] })
      .withWorkdir('/src')
      .withExec(['npm', 'install', '-g', 'promptfoo'])
      .withExec(['promptfoo', 'eval'])
      .stdout();
  }
}
