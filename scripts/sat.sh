#!/bin/bash
set -eu
cd "`dirname "$0"`/.."

set +u
if [ -z "$CI" ]; then
    set -u
    docker run -e SAT=1 -v "`pwd`":/app alpine sh -c 'apk add --update bash && /app/scripts/_sat.sh'
    hostname > public/graphdata/hostname.txt
else
    set -u
    echo "refusing to run sat-solver in a CI environment, because UNSAT runs can take a very long time. Run it manually!"
    exit 1
fi
