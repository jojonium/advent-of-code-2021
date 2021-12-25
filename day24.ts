import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day24.txt';

// Numbers we can change:
//  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
//   ^  ^  ^  ^     ^        ^

type Register = 'w' | 'x' | 'y' | 'z';
const isReg = (s: string) => 'wxyz'.includes(s);
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Run by interpreting the input.
const run = (instructions: string[], input: number[]) => {
  const regs = {w: 0, x: 0, y: 0, z: 0};
  let inputIndex = 0;
  for (const ins of instructions) {
    const args = ins.split(' ');
    if (args[0] === 'inp') {
      //console.log(regs);
      if (inputIndex >= input.length) throw new Error("Can't read input");
      regs[args[1] as Register] = input[inputIndex++]!!;
      continue;
    }
    const num2 = (isReg(args[2] ?? 'nope'))
      ? regs[args[2] as Register]
      : +args[2]!!
    const reg = args[1] as Register;
    if (args[0] === 'add') regs[reg] = regs[reg] + num2;
    else if (args[0] === 'mul') regs[reg] = regs[reg] * num2;
    else if (args[0] === 'div') regs[reg] = Math.floor(regs[reg] / num2);
    else if (args[0] === 'mod') regs[reg] = regs[reg] % num2;
    else if (args[0] === 'eql') regs[reg] = Number(regs[reg] === num2);
  }
  return regs;
};

// Input program translated to simple JavaScript.
const run2 = (input: number[]) => {
  let z = 0;
  z = z * 26 + input[0]!!;
  z = z * 26 + input[1]!! + 6;
  z = z * 26 + input[2]!! + 4;
  z = z * 26 + input[3]!! + 2;
  z = z * 26 + input[4]!! + 9;

  let x = z;
  z = Math.floor(z / 26);
  if (input[5] !== x % 26 - 2) z = z * 26 + input[5]!! + 1;

  if (input[6] !== z % 26 + 11) z = z * 26 + input[6]!! + 10;

  x = z;
  z = Math.floor(z / 26);
  if (input[7] !== x % 26 - 15) z = z * 26 + input[7]!! + 6;

  x = z;
  z = Math.floor(z / 26);
  if (input[8] !== x % 26 - 10) z = z * 26 + input[8]!! + 4;

  if (input[9] !== z % 26 + 10) z = z * 26 + input[9]!! + 6;

  x = z;
  z = Math.floor(z / 26);
  if (input[10] !== x % 26 - 10) z = z * 26 + input[10]!! + 3;

  x = z;
  z = Math.floor(z / 26);
  if (input[11] !== x % 26 - 4) z = z * 26 + input[11]!! + 9;

  x = z;
  z = Math.floor(z / 26);
  if (input[12] !== x % 26 - 1) z = z * 26 + input[12]!! + 15;

  x = z;
  z = Math.floor(z / 26);
  if (input[13] !== x % 26 - 1) z = z * 26 + input[13]!! + 5;

  return z;
};

// Input program translated to using base 26.
const run3 = (input: number[]) => {
  let z = [] as number[];
  z.push(input[0]!!);
  z.push(input[1]!! + 6);
  z.push(input[2]!! + 4);
  z.push(input[3]!! + 2);
  z.push(input[4]!! + 9);

  let x = z.pop();
  input[5] = x!! - 2;
  if (input[5]!! !== x!! - 2) z.push(input[5]!! + 1);

  z.push(input[6]!! + 10);

  x = z.pop();
  input[7] = x!! - 15;
  if (input[7]!! !== x!! - 15) z.push(input[7]!! + 6);

  x = z.pop();
  input[8] = x!! - 10;
  if (input[8]!! !== x!! - 10) z.push(input[8]!! + 4);

  z.push(input[9]!! + 6);

  x = z.pop();
  input[10] = x!! - 10;
  if (input[10]!! !== x!! - 10) z.push(input[10]!! + 3);

  x = z.pop();
  input[11] = x!! - 4;
  if (input[11]!! !== x!! - 4) z.push(input[11]!! + 9);

  x = z.pop();
  input[12] = x!! - 1;
  if (input[12]!! !== x!! - 1) z.push(input[12]!! + 15);

  x = z.pop();
  input[13] = x!! - 1;
  if (input[13]!! !== x!! - 1) z.push(input[13]!! + 5);

  console.log(z.map(x => letters[x]).join(''));
  console.log(input.join());
  return z.reduceRight(
    (sum, letter, i) => sum + (letter * (26 ** (z.length - i - 1))), 0
  );
};


(async () => {
  const instructions = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n');

  // Part 1
  let input = [9, 4, 9, 9, 2, 9, 9, 4, 1, 9, 5, 9, 9, 8];
  console.log(run(instructions, input));
  console.log(run2(input));
  console.log(run3(input));
  console.log('Part 1: ' + input.join(''));

  // Part 2
  input = [2, 1, 1, 9, 1, 1, 6, 1, 1, 5, 1, 1, 1, 1];
  console.log(run(instructions, input));
  console.log(run2(input));
  console.log(run3(input));
  console.log('Part 2: ' + input.join(''));

})();
