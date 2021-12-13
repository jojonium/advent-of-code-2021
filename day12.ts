import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day12.txt';

type Node = {
  isBig: boolean
  neighbors: Set<string>
};

const DEBUG = process.env['DEBUG'] ?? false;

const pathsBetween = (
  start: string,
  end: string,
  graph: Map<string, Node>,
  part2: boolean
): number => {
  const v = new Set<string>();
  const paths: string[][] = [];

  const pathUtil = (
    b: string,
    graph: Map<string, Node>,
    visited: Set<string>,
    currentPath: string[] = ['start'],
    revisitUsed = !part2
  ): number => {
    if (b === end) {
      paths.push(currentPath);
      return 1;
    }
    const bNode = graph.get(b)!!;
    if (!bNode.isBig && visited.has(b)) {
      if (!part2 || revisitUsed || b === 'start') return 0;
      revisitUsed = true;
    }

    return Array.from(bNode.neighbors).reduce((cnt, neighbor) => {
      const newVisited = new Set(visited.keys());
      newVisited.add(b);
      return cnt + pathUtil(
        neighbor,
        graph,
        newVisited,
        [...currentPath, neighbor],
        revisitUsed
      )
    }, 0);
  };

  const n = pathUtil(start, graph, v);
  if (DEBUG) console.log(paths);
  return n;
};

(async () => {
  const graph = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
    .reduce((graph, line) => {
      const [a, b] = line.trim().split('-');
      if (a === undefined || b === undefined) throw new Error('Bad input!');
      if (!graph.has(a)) {
        graph.set(a, {
          isBig: a.toUpperCase() === a,
          neighbors: new Set([b])
        });
      }
      graph.get(a)!!.neighbors.add(b);
      if (!graph.has(b)) {
        graph.set(b, {
          isBig: b.toUpperCase() === b,
          neighbors: new Set()
        });
      }
      graph.get(b)!!.neighbors.add(a);
      return graph;
    }, new Map<string, Node>());
  if (DEBUG) console.log(graph);

  console.log('Part 1: ' + pathsBetween('start', 'end', graph, false));
  console.log('Part 2: ' + pathsBetween('start', 'end', graph, true));
})();
