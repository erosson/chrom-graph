#!/bin/bash
set -eux
cd "`dirname "$0"`/.."

set +u
if [ -z "$SAT" ]; then
    echo "usage: ./scripts/sat.sh (_sat.sh runs inside docker)"
    exit 1
fi
set -u

# don't use the shell's builtin `time`, it doesn't have `--output`.
# also, https://www.ssbwiki.com/Witch_Time
# json formatting from https://gist.github.com/vadimkantorov/016326dfce61ddf6f00210440dcaa2c9
shopt -s expand_aliases
alias timejson="`which time`"' -f '"'"'{"exit_code" : %x, "time_user_seconds" : %U, "time_system_seconds" : %S, "time_wall_clock_seconds" : %e, "rss_max_kbytes" : %M, "rss_avg_kbytes" : %t, "page_faults_major" : %F, "page_faults_minor" : %R, "io_inputs" : %I, "io_outputs" : %O, "context_switches_voluntary" : %w, "context_switches_involuntary" : %c, "cpu_percentage" : "%P", "signals_received" : %k}'"'"

for f in public/graphdata/*.cnf; do
    o=`basename $f .cnf`.sat.txt
    t=`basename $f .cnf`.time.txt
    timejson -o public/graphdata/$t ./vendor/minisat/core/minisat_static $f public/graphdata/$o || true
done
# iso-8601 with seconds precision; utc
date -Is -u | tee public/graphdata/date.txt
