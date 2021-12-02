#!/bin/bash

INPUT="${1:-inputs/day02.txt}"

awk '
/up/ {depth = depth - $2}
/down/ {depth = depth + $2}
/forward/ {x = x + $2}
END {print "Part 1:", depth * x}
' "$INPUT"

awk '
/up/ {aim = aim - $2}
/down/ {aim = aim + $2}
/forward/ {
  x = x + $2
  depth = depth + aim * $2
}
END {print "Part 2:", depth * x}
' "$INPUT"
