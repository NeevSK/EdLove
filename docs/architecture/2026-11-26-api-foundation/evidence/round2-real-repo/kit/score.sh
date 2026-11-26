#!/usr/bin/env bash
# score.sh <worktree> <T1..T4>: run the hidden behaviour test for a task against the real router + Postgres.
W=$1; T=$2; H=$W/apps/sanctuary-api/src/__hidden__; K=$(dirname "$0")
mkdir -p $H && cp $K/_db.ts $K/$T.test.ts $H/
cd $W/apps/sanctuary-api && npx vitest run src/__hidden__/$T.test.ts --reporter=json --outputFile=/tmp/score-$$.json >/dev/null 2>&1
node -e "const r=require('/tmp/score-$$.json');const f=r.testResults.flatMap(t=>t.assertionResults).filter(a=>a.status!=='passed').map(a=>a.title);console.log(JSON.stringify({passed:r.numPassedTests,failed:r.numFailedTests+(r.numTotalTests?0:1),failures:f}))"
rm -rf $H /tmp/score-$$.json
