#!/bin/bash

INPUT="${1:-inputs/day06.txt}"

awk -v FS="," '
function solve(days, a, b) {
  delete c; delete d
  for (i in a) c[i] = a[i]
  for (i in b) d[i] = b[i]
  for (i = 1; i <= days; ++i) {
    d[(i + 9) % 7] += c[i % 7]
    c[i % 7] += d[i % 7]
    d[i % 7] = 0
  }
  count = 0
  for (day in c) { count += c[day] + d[day] }
  return count
}
BEGIN {
  for (i = 1; i <= 7; ++i) { 
    adult[i] = 0
    young[i] = 0
  }
}
{ for (i = 1; i <= NF; ++i) adult[$i + 1]++ }
END {
  print "Part 1:", solve(80, adult, young)
  print "Part 2:", solve(256, adult, young)
}
' "$INPUT"
