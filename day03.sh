#!/bin/bash

INPUT="${1:-inputs/day03.txt}"

COLS=$(awk 'NR==1{print length($0)}' "$INPUT")
GAMMA=""
for ((i=1; i<=$COLS; i++))
do
  BIT=$(awk -v FS="" '{print $'$i'}' "$INPUT" | sort | uniq -c | sort -n -r | awk 'NR==1 {print $2}')
  GAMMA=$GAMMA$BIT
done
EPSILON=$(echo $GAMMA | tr 01 10)
echo Part 1: $((2#$GAMMA * 2#$EPSILON))

# Part 2

COLS=$(awk 'NR==1{print length($0)}' "$INPUT")
BITS=""
MATCHES=$(cat "$INPUT")
for ((i=1; i<=$COLS; i++))
do
  BITS=$BITS$(awk -v FS="" '{print $'$i'}' <<< "$MATCHES" | sort | uniq -c | sort -n -r | awk 'NR==1 {print $2}')
  MATCHES=$(awk '/^'$BITS'/ {print $0}' "$INPUT")
  if [[ $(wc -l <<< $MATCHES) -eq 1 ]];
  then
    OXYGEN=$MATCHES
    break;
  fi
done

BITS=""
MATCHES=$(cat "$INPUT")
for ((i=1; i<=$COLS; i++))
do
  BITS=$BITS$(awk -v FS="" '{print $'$i'}' <<< "$MATCHES" | sort | uniq -c | sort -n -r | awk 'NR==2 {print $2}')
  MATCHES=$(awk '/^'$BITS'/ {print $0}' "$INPUT")
  if [[ $(wc -l <<< $MATCHES) -eq 1 ]];
  then
    CO2=$MATCHES
    break;
  fi
done
echo Part 2: $((2#$OXYGEN * 2#$CO2))
