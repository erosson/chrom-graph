#!/bin/bash
set -eu
cd "`dirname "$0"`/.."

# don't use the shell's builtin `time`, it doesn't have `--output`.
# also, https://www.ssbwiki.com/Witch_Time
# json formatting from https://gist.github.com/vadimkantorov/016326dfce61ddf6f00210440dcaa2c9
shopt -s expand_aliases
alias timejson="`which time`"' -f '"'"'{"exit_code" : %x, "time_user_seconds" : %U, "time_system_seconds" : %S, "time_wall_clock_seconds" : %e, "rss_max_kbytes" : %M, "rss_avg_kbytes" : %t, "page_faults_major" : %F, "page_faults_minor" : %R, "io_inputs" : %I, "io_outputs" : %O, "context_switches_voluntary" : %w, "context_switches_involuntary" : %c, "cpu_percentage" : "%P", "signals_received" : %k}'"'"

set +u
if [ -z "$CI" ]; then
    set -u
    for f in public/graphdata/*.cnf; do
        o=`basename $f .cnf`.sat.txt
        t=`basename $f .cnf`.time.txt
        h=`basename $f .cnf`.hostname.txt
        timejson --output public/graphdata/$t ./vendor/minisat/core/minisat_static $f public/graphdata/$o || true
        hostname > public/graphdata/$h
    done
else
    set -u
    echo "refusing to run sat-solver in a CI environment. UNSAT runs can take a very long time. Run it manually!"
    exit 1
fi
