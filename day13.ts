import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day13.txt';

const prettyPrint = (paper: Set<string>) => {
  const extremes = Array.from(paper).reduce((extremes, point) => {
    const [x, y] = point.split(',');
    if (+x!! > extremes.maxX) extremes.maxX = +x!!;
    if (+y!! > extremes.maxY) extremes.maxY = +y!!;
    if (+x!! < extremes.minX) extremes.minX = +x!!;
    if (+y!! < extremes.minY) extremes.minY = +y!!;
    return extremes;
  }, {maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity});
  let str = '';
  for (let j = extremes.minY; j <= extremes.maxY; ++j) {
    for (let i = extremes.minX; i <= extremes.maxX; ++i) {
      if (paper.has(`${i},${j}`)) str += '#';
      else str += ' ';
    }
    str += '\n';
  }
  console.log(str);
}

const fold = (paper: Set<string>, dir: string, fold: number): Set<string> =>
  Array.from(paper).reduce((paper, point) => {
    const [x, y] = point.split(',').map(x => +x);
    if (dir === 'y' && y!! > fold) {
      paper.delete(point);
      paper.add(`${x},${fold - (y!! - fold)}`)
    } else if (dir === 'x' && x!! > fold) {
      paper.delete(point);
      paper.add(`${fold - (x!! - fold)},${y}`)
    }
    return paper;
  }, paper);

(async () => {
  const [points, instructions] = (await fsPromises.readFile(inputFile))
    .toString()
    .split('\n\n').map(para => para.trim().split('\n'));
  const paper = new Set(points);

  for (const line of instructions!!) {
    const [dir, num] = line!!.split(' ')[2]!!.trim().split('=')
    fold(paper, dir!!, +num!!);
    if (line === instructions!![0]) {
      console.log('Part 1: ' + paper.size);
    }
  }
  console.log('Part 2:');
  prettyPrint(paper);
})();
