#!/bin/sh
set -eux
cd "`dirname "$0"`/.."

for f in public/graphdata/*.cnf; do
    o=`basename $f .cnf`.sat
    ./vendor/minisat/core/minisat_static $f public/graphdata/$o || true
done
