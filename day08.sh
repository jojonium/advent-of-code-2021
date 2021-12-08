#!/bin/bash

INPUT="${1:-inputs/day08.txt}"

awk '
function alphabetize(word) {
  result = ""
  split(word, splitWord, "")
  asort(splitWord)
  for (sw in splitWord) result = result splitWord[sw]
  return result
}

{
  for (i = 1; i <= 10; ++i) {
    elt = alphabetize($i)
    if (length(elt) == 2) { map[elt] = 1; one = elt }
    else if (length(elt) == 3) { map[elt] = 7; seven = elt }
    else if (length(elt) == 4) { map[elt] = 4; four = elt }
    else if (length(elt) == 7) { map[elt] = 8; eight = elt }
  }
  for (i = 1; i <= 10; ++i) {
    delete missingArr; delete letters; delete alpha;
    elt = alphabetize($i)
    if (length(elt) == 6) {
      split(elt, letters, "")
      split("abcdefg", alpha, "")
      for (m in alpha) { if (!match(elt, alpha[m])) missing = alpha[m] }
      c = (match(one, missing) > 0) + (match(seven, missing) > 0) + (match(four, missing) > 0)
      if (c == 0) map[elt] = 9
      if (c == 1) map[elt] = 0
      if (c == 3) map[elt] = 6
    }

    else if (length(elt) == 5) {
      split(elt, letters, "")
      split("abcdefg", alpha, "")
      for (m in alpha) { if (!match(elt, alpha[m])) missingArr[m] = alpha[m] }
      c = 0
      for (j in missingArr) {
        c += (match(one, missingArr[j]) > 0)
        c += (match(seven, missingArr[j]) > 0)
        c += (match(four, missingArr[j]) > 0)
      }
      if (c == 1) map[elt] = 3
      if (c == 4) map[elt] = 2
      if (c == 3) map[elt] = 5
    }
  }
  
  display = ""
  for (i = 12; i <= 15; ++i) {
    elt = alphabetize($i)
    l = length($i)
    if (l == 2 || l == 3 || l == 4 || l == 7) part1++
    display = display map[elt]
  }
  part2 += int(display)
}

END {
  print("Part 1: " part1)
  print("Part 2: " part2)
}
' "$INPUT"
