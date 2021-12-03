#!/bin/bash

INPUT="${1:-inputs/day03.txt}"

COLS=$(awk 'NR==1{print length($0)}' "$INPUT")
GAMMA=""
for ((i=1; i<=$COLS; i++)); do
  BIT=$(awk -v FS="" '{print $'$i'}' "$INPUT" | sort | uniq -c | sort -n -r | awk 'NR==1 {print $2}')
  GAMMA=$GAMMA$BIT
done
EPSILON=$(echo $GAMMA | tr 01 10)
echo Part 1: $((2#$GAMMA * 2#$EPSILON))


COLS=$(awk 'NR==1{print length($0)}' "$INPUT")
OXYGEN_MATCHES=$(cat "$INPUT")
CO2_MATCHES=$(cat "$INPUT")

for ((i=1; i<=$COLS; i++)); do
  if [[ -z $OXYGEN ]]; then
    OXYGEN_BITS=$OXYGEN_BITS$(awk -v FS="" '{print $'$i'}' <<< "$OXYGEN_MATCHES" | sort | uniq -c | sort -n -r | awk 'NR==1 {print $2}')
    OXYGEN_MATCHES=$(awk '/^'$OXYGEN_BITS'/ {print $0}' "$INPUT")
  fi
  if [[ -z $CO2 ]]; then
    CO2_BITS=$CO2_BITS$(awk -v FS="" '{print $'$i'}' <<< "$CO2_MATCHES" | sort | uniq -c | sort -n -r | awk 'NR==2 {print $2}')
    CO2_MATCHES=$(awk '/^'$CO2_BITS'/ {print $0}' "$INPUT")
  fi
  [[ $(wc -l <<< $OXYGEN_MATCHES) -eq 1 ]] && OXYGEN=$OXYGEN_MATCHES
  [[ $(wc -l <<< $CO2_MATCHES) -eq 1 ]] && CO2=$CO2_MATCHES
done

echo Part 2: $((2#$OXYGEN * 2#$CO2))
