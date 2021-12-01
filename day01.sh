#!/bin/bash

INPUT="${1:-inputs/day01.txt}"

awk '
BEGIN {cnt = 0}

NR == 1 {last = $0}

NR != 1 {
  if ($0 > last) cnt++
  last = $0
}

END {print "Part 1:", cnt}
' $INPUT

awk '
BEGIN {cnt = 0}
NR == 1 {c = $0}
NR == 2 {b = $0}
NR == 3 {a = $0}
NR >= 4 {
  if ($0 + a + b > a + b + c) cnt++
  c = b
  b = a
  a = $0
}
END {print "Part 2:", cnt}
' $INPUT
