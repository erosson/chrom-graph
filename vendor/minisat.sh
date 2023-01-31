#!/bin/sh
set -eu
cd "`dirname "$0"`"

## how do I compile source, I am JS programmer, halp
wget http://minisat.se/downloads/minisat-2.2.0.tar.gz -O minisat.tar.gz
tar xvfz minisat.tar.gz

## oh, they have precompiled binaries, hooray
## but it fails on gitpod, boo
#wget http://minisat.se/downloads/MiniSat_v1.14_linux -O minisat
#chmod +x minisat
