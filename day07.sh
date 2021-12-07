#!/bin/bash

INPUT="${1:-inputs/day07.txt}"

awk -v FS="," '
function abs(x) {
  return ((x < 0) ? -x : x)
}

function factorial(x) {
  if (x <= 0) return 0
  else return x + factorial(x - 1)
}

function solve(arr, target) {
  sum = 0
  for (i in arr) sum += factorial(abs(arr[i] - target))
  return sum
}

{
  for (i = 1; i <= NF; ++i) crabs[i] = $i
  n = asort(crabs)
}

END {
  median = crabs[int(n / 2)]
  for (i in crabs) {
    total += crabs[i]
    part1 += abs(crabs[i] - median)
  }
  print "Part 1:", part1
  
  mean = int(total / n)
  target = mean
  part2 = solve(crabs, target)
  nxt = part2

  do { # Climb up.
    nxt = solve(crabs, ++target)
    if (nxt < part2) part2 = nxt
  } while (nxt < part2)
  target = mean
  do { # Climb down.
    nxt = solve(crabs, --target)
    if (nxt < part2) part2 = nxt
  } while (nxt < part2)

  print "Part 2:", part2
}
' "$INPUT"
