#!/bin/bash
set -eux
cd "`dirname "$0"`/.."

set +u
if [ -z "$CI" ]; then
    set -u
    if command -v winpty; then
        # windows. double-slash in paths prevents mangling
        winpty docker run -e SAT=1 -v /"`pwd`"://app -it alpine sh -c "apk add --update bash && bash /app/scripts/_sat.sh"
    else
        # non-windows
        docker run -e SAT=1 -v "`pwd`":/app -it alpine sh -c "apk add --update bash && bash /app/scripts/_sat.sh"
    fi
    hostname > public/graphdata/hostname.txt
else
    set -u
    echo "refusing to run sat-solver in a CI environment, because UNSAT runs can take a very long time. Run it manually!"
    exit 1
fi
