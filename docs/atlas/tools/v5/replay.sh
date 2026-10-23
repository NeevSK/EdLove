#!/bin/sh
# Replay a ref's migrations into a throwaway local Postgres 17 (Supabase stubs from boot.sql next to this script). Local only.
# Usage: replay.sh [ref]   env: EDLOVE_REPO (default: this repo), PGBIN (default /usr/lib/postgresql/17/bin), PORT
HERE=$(cd "$(dirname "$0")" && pwd); PG=${PGBIN:-/usr/lib/postgresql/17/bin}
REPO=${EDLOVE_REPO:-$(git -C "$HERE" rev-parse --show-toplevel)}
REF=${1:-origin/terrain/version-hops}; R=${TMPDIR:-/tmp}/pgreplay-$(echo $REF | tr "/" "_")
rm -rf $R; mkdir -p $R/mig
cd "$REPO" && git archive $REF apps/gurudevi-mobile/supabase/migrations | tar -x -C $R/mig
$PG/initdb -D $R/data -U postgres -A trust >/dev/null
$PG/pg_ctl -D $R/data -o "-p ${PORT:-55439} -k $R -c listen_addresses=''" -l $R/pg.log -w start >/dev/null
P="psql -h $R -p ${PORT:-55439} -U postgres -d postgres -q -X"
$P -f "$HERE/boot.sql" >/dev/null 2>$R/boot_err.txt
for e in postgis vector pg_trgm '"uuid-ossp"'; do $P -c "create extension if not exists $e schema extensions" >/dev/null 2>>$R/boot_err.txt; done
cd $R/mig/apps/gurudevi-mobile/supabase/migrations; : > $R/results.txt
for f in $(ls *.sql | sort); do
  out=$(timeout 60 $P -1 -v ON_ERROR_STOP=1 -f $f 2>&1 >/dev/null | grep -m1 -E "ERROR|timeout")
  if [ -z "$out" ]; then echo "ok $f"; else echo "FAIL $f :: $out"; fi >> $R/results.txt
done
$PG/pg_ctl -D $R/data stop >/dev/null
echo DONE $(grep -c ^ok $R/results.txt) ok $(grep -c ^FAIL $R/results.txt) fail
