import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day15.txt';

type Node = {
  x: number,
  y: number,
  cameFrom: Node | undefined,
  gScore: number,
  fScore: number,
  risk: number,    // Basically the distance to this node from any neighbor.
  neighbors: Set<Node>
};

const manhattanDistance = (start: Node, target: Node): number =>
  Math.abs(target.x - start.x) + Math.abs(target.y - start.y);

const reconstructPath = (current: Node): number => {
  const totalPath = [current];
  let totalRisk = current.risk;
  while (current.cameFrom !== undefined) {
    current = current.cameFrom;
    totalPath.unshift(current);
    totalRisk += current.risk;
  }
  // We never enter the first node, so subtract that risk.
  totalRisk -= totalPath[0]?.risk ?? 0;
  return totalRisk;
};

const aStar = (
  start: Node,
  target: Node,
  heuristic: (start: Node) => number
): number => {
  const openSet = new Set([start]);
  start.gScore = 0;
  start.fScore = heuristic(start);
  while (openSet.size > 0) {
    const current: Node =
      Array.from(openSet.values()).sort((a, b) => a.fScore - b.fScore)[0]!!;
    if (current === target) {
      return reconstructPath(current);
    }
    openSet.delete(current);
    for (const neighbor of Array.from(current.neighbors)) {
      const tempGScore = current.gScore + neighbor.risk;
      if (tempGScore < neighbor.gScore) {
        neighbor.cameFrom = current;
        neighbor.gScore = tempGScore;
        neighbor.fScore = tempGScore + heuristic(neighbor);
        if (!openSet.has(neighbor)) {
          openSet.add(neighbor);
        }
      }
    }
  }
  return -Infinity; // No path found.
}

(async () => {
  const riskMap = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
    .reduce((map, line, row) =>
      line.trim().split('').reduce((map, risk, col) =>
        map.set(`${col},${row}`, {
          x: col,
          y: row,
          gScore: Infinity,
          fScore: Infinity,
          risk: +risk,
          cameFrom: undefined,
          neighbors: new Set()
        } as Node), map),
      new Map<string, Node>()
    );

  let start = riskMap.get('0,0')!!;
  let target = start;
  Array.from(riskMap.values()).forEach(node => {
    for (const key of [
      `${node.x - 1},${node.y}`,
      `${node.x + 1},${node.y}`,
      `${node.x},${node.y - 1}`,
      `${node.x},${node.y + 1}`,
    ]) {
      if (riskMap.has(key)) node.neighbors.add(riskMap.get(key)!!);
    }
    if (node.x > target.x || node.y > target.y) target = node;
  });

  const width = target.x + 1;
  const height = target.y + 1;

  console.log('Part 1: ' +
    aStar(start, target, (s) => manhattanDistance(s, target))
  );

  Array.from(riskMap.values()).forEach(node => {
    for (let x = 0; x < 5; ++x) {
      for (let y = 0; y < 5; ++y) {
        riskMap.set(`${node.x + (x * width)},${node.y + (y * height)}`,
          {
            x: node.x + (x * width),
            y: node.y + (y * height),
            gScore: Infinity,
            fScore: Infinity,
            risk: ((node.risk + x + y - 1) % 9) + 1,
            cameFrom: undefined,
            neighbors: new Set()
          } as Node
        );
      }
    }
  });

  Array.from(riskMap.values()).forEach(node => {
    for (const key of [
      `${node.x - 1},${node.y}`,
      `${node.x + 1},${node.y}`,
      `${node.x},${node.y - 1}`,
      `${node.x},${node.y + 1}`,
    ]) {
      if (riskMap.has(key)) node.neighbors.add(riskMap.get(key)!!);
    }
  });

  start = riskMap.get('0,0')!!;
  target = riskMap.get(`${width * 5 - 1},${height * 5 - 1}`)!!;

  console.log('Part 2: ' +
    aStar(start, target, (s) => manhattanDistance(s, target))
  );
})();
