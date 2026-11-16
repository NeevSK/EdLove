# E1 Isolated Worktree Specification & Environment Ledger

**Experiment:** Study 3 — E1 Snapshot Integrity Helper Extraction  
**Anchor Commit:** `252bec65f746c362fec12472999cccfba187d0b9`  
**Anchor Branch:** Detached HEAD from `integrate/worlds-and-upstream`  
**Worktree Directory:** `C:\x\.tmp-worktrees\exp-e1`  
**Isolation Status:** Active, Pristine Clean, Fully Verified  

---

## 1. Worktree Isolation Topology

To prevent contamination of the primary checkout, dirtying developer staging trees, or accidental regression leaks during longitudinal brownfield experiments, a dedicated git worktree has been provisioned:

```
C:\x (Main Checkout: integrate/worlds-and-upstream @ 252bec65f)
 └── .tmp-worktrees/
      └── exp-e1 (Disposable Worktree: detached HEAD @ 252bec65f)
```

### Git Ignored Boundary
`.gitignore` enforces `.tmp-*/` exclusion, ensuring that the worktree and its generated artifacts are completely invisible to the root repository's git status.

```powershell
> git worktree list
C:/x                        252bec65f [integrate/worlds-and-upstream]
C:/x/.tmp-worktrees/exp-e1  252bec65f (detached HEAD)

> git -C C:/x/.tmp-worktrees/exp-e1 status
Not currently on any branch.
nothing to commit, working tree clean
```

---

## 2. Environment Verification & Baseline Gate Results

All baseline test suites and governance checks were executed inside `C:\x\.tmp-worktrees\exp-e1` to verify complete operational parity with the main checkout:

| Verification Target | Command Executed in Worktree | Duration | Exit Code | Result |
| :--- | :--- | :---: | :---: | :--- |
| **Authorization Parity** | `node C:/x/.tmp-worktrees/exp-e1/scripts/check-authorization-parity.mjs` | 0.12s | 0 | **PASS:** 58 resources, 5 actions, 6 migrations verified. |
| **Existing Unit Suites** | `pnpm --prefix C:/x/.tmp-worktrees/exp-e1/packages/core test src/logic/permissions/__tests__/localEvaluator.native.test.ts src/logic/permissions/__tests__/localEvaluator.native.dynamic.test.ts` | 2.33s | 0 | **PASS:** 2 test files, 26/26 tests passed. |
| **E1 Acceptance Tests** | `pnpm --prefix C:/x/.tmp-worktrees/exp-e1/packages/core exec vitest run --config C:/x/research/study-3-brownfield/acceptance-tests/vitest.config.ts` | 1.66s | 0 | **PASS:** 1 test file, 19/19 acceptance tests passed. |

---

## 3. Worktree Operational Playbook

### Running Acceptance Tests inside the Worktree:
```powershell
pnpm --prefix C:/x/.tmp-worktrees/exp-e1/packages/core exec vitest run --config C:/x/research/study-3-brownfield/acceptance-tests/vitest.config.ts
```

### Running Native Permission Suites inside the Worktree:
```powershell
pnpm --prefix C:/x/.tmp-worktrees/exp-e1/packages/core test src/logic/permissions/__tests__/localEvaluator.native.test.ts src/logic/permissions/__tests__/localEvaluator.native.dynamic.test.ts
```

### Resetting Worktree to Pristine Baseline:
```powershell
git -C C:/x/.tmp-worktrees/exp-e1 reset --hard 252bec65f746c362fec12472999cccfba187d0b9
git -C C:/x/.tmp-worktrees/exp-e1 clean -fd
```

### Decommissioning the Worktree (Post-Experiment):
```powershell
git worktree remove C:/x/.tmp-worktrees/exp-e1 --force
```
