import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day23.txt';

type State = {
  hallway: Space[];
  room1: [Space, Space],
  room2: [Space, Space],
  room3: [Space, Space],
  room4: [Space, Space],
  totalEnergy: number
};
type Amphipod = 'A' | 'B' | 'C' | 'D';
type Space = Amphipod | '.';
type RoomKey = 'room1' | 'room2' | 'room3' | 'room4';

const prettyPrint = (state: State): void =>
  console.log('#'.repeat(state.hallway.length + 2) + '\n' +
    '#' + state.hallway.join('') + '#\n' +
    `###${state.room1[0]}#${state.room2[0]}#${state.room3[0]}#${state.room4[0]}###\n` +
    `  #${state.room1[1]}#${state.room2[1]}#${state.room3[1]}#${state.room4[1]}#  \n` +
    '  ' + '#'.repeat(state.hallway.length - 2) + '\n');

const toString = (state: State): string =>
  state.hallway.join('') + state.room1.join('') + state.room2.join('') +
  state.room3.join('') + state.room4.join('');

// Deep copy.
const clone = (state: State): State => ({
  hallway: state.hallway.map(s => s),
  room1: [state.room1[0], state.room1[1]],
  room2: [state.room2[0], state.room2[1]],
  room3: [state.room3[0], state.room3[1]],
  room4: [state.room4[0], state.room4[1]],
  totalEnergy: state.totalEnergy
});

const hasWon = (state: State): boolean =>
  state.room1[0] === 'A' &&
  state.room1[1] === 'A' &&
  state.room2[0] === 'B' &&
  state.room2[1] === 'B' &&
  state.room3[0] === 'C' &&
  state.room3[1] === 'C' &&
  state.room4[0] === 'D' &&
  state.room4[1] === 'D';

const score = (state: State): number => {
  let out = 0;
  if (state.room1[0] === 'A') out += 1;
  if (state.room1[1] === 'A') out += 1;
  if (state.room2[0] === 'B') out += 10;
  if (state.room2[1] === 'B') out += 10;
  if (state.room3[0] === 'C') out += 100;
  if (state.room3[1] === 'C') out += 100;
  if (state.room4[0] === 'D') out += 1000;
  if (state.room4[1] === 'D') out += 1000;
}

const infos = new
  Map<Amphipod, {cost: number, others: string, door: number, room: RoomKey}>();

infos.set('A', {cost: 1, others: 'BCD', door: 2, room: 'room1'});
infos.set('B', {cost: 10, others: 'ACD', door: 4, room: 'room2'});
infos.set('C', {cost: 100, others: 'ABD', door: 6, room: 'room3'})
infos.set('D', {cost: 1000, others: 'ABC', door: 8, room: 'room4'});

const allValidMoves = (state: State): State[] => {
  const out = [] as State[];
  for (const letter of ['A', 'B', 'C', 'D'] as Amphipod[]) {
    const info = infos.get(letter);
    if (info === undefined) continue;
    const stateRoom = state[info.room];

    // Check if any hallway-dwelling amphipods can move into the right room.
    state.hallway.forEach((hall, i) => {
      if (hall !== letter) return;
      //console.log(`Found '${letter}' at position ${i}`);
      if (stateRoom[0] !== '.' || info.others.includes(stateRoom[1])) return;
      for (let s = i; s !== info.door; s += Math.sign(info.door - i)) {
        if (state.hallway[s] !== '.' && s !== i) {
          //console.log(`${letter} is blocked at ${s}`);
          return; // Blocked.
        }
      }
      //console.log(`${letter} can make it!`);
      if (stateRoom[1] === '.') { // Move to back of desired room.
        const newState = clone(state);
        newState.hallway[i] = '.';
        newState[info.room][1] = letter;
        newState.totalEnergy += (Math.abs(info.door - i) + 2) * info.cost;
        out.push(newState);
      }
      // Move to front of desired room.
      const newState = clone(state);
      newState.hallway[i] = '.';
      newState[info.room][0] = letter;
      newState.totalEnergy += (Math.abs(info.door - i) + 1) * info.cost;
      out.push(newState);
    });
  }

  // Check if any room-dwelling amphipods can move into the hallway
  for (const roomKey of ['room1', 'room2', 'room3', 'room4'] as RoomKey[]) {
    const room = state[roomKey];
    // Front of room.
    if (room[0] !== '.') {
      const info = infos.get(room[0]);
      if (info === undefined) continue;
      const door = +roomKey.substring(4) * 2;
      // Move right down the hall.
      for (let s = door + 1; s < state.hallway.length; s++) {
        if (state.hallway[s] !== '.') break;
        if (s === 2 || s === 4 || s === 6 || s === 8) continue;
        const newState = clone(state);
        newState.hallway[s] = room[0];
        newState[roomKey][0] = '.';
        newState.totalEnergy += (s - door + 1) * info.cost;
        out.push(newState);
      }
      // Move left down the hall.
      for (let s = door - 1; s >= 0; s--) {
        if (state.hallway[s] !== '.') break;
        if (s === 2 || s === 4 || s === 6 || s === 8) continue;
        const newState = clone(state);
        newState.hallway[s] = room[0];
        newState[roomKey][0] = '.';
        newState.totalEnergy += (door - s + 1) * info.cost;
        out.push(newState);
      }
    }
    // Back of room.
    if (room[0] === '.' && room[1] !== '.') {
      const info = infos.get(room[1]);
      if (info === undefined) continue;
      const door = +roomKey.substring(4) * 2;
      // Move right down the hall.
      for (let s = door + 1; s < state.hallway.length; s++) {
        if (state.hallway[s] !== '.') break;
        if (s === 2 || s === 4 || s === 6 || s === 8) continue;
        const newState = clone(state);
        newState.hallway[s] = room[1];
        newState[roomKey][1] = '.';
        newState.totalEnergy += (s - door + 2) * info.cost;
        out.push(newState);
      }
      // Move left down the hall.
      for (let s = door - 1; s >= 0; s--) {
        if (state.hallway[s] !== '.') break;
        if (s === 2 || s === 4 || s === 6 || s === 8) continue;
        const newState = clone(state);
        newState.hallway[s] = room[1];
        newState[roomKey][1] = '.';
        newState.totalEnergy += (door - s + 2) * info.cost;
        out.push(newState);
      }
    }
  }
  return out;
};

(async () => {
  const inputLines = (await fsPromises.readFile(inputFile))
    .toString()
    .split('\n');
  const state: State = {
    hallway: inputLines[1]!!.trim().split('')
      .filter(s => '.ABCD'.includes(s)) as Space[],
    room1: [
      inputLines[2]!!.substring(3, 4) as Space,
      inputLines[3]!!.substring(3, 4) as Space
    ],
    room2: [
      inputLines[2]!!.substring(5, 6) as Space,
      inputLines[3]!!.substring(5, 6) as Space
    ],
    room3: [
      inputLines[2]!!.substring(7, 8) as Space,
      inputLines[3]!!.substring(7, 8) as Space
    ],
    room4: [
      inputLines[2]!!.substring(9, 10) as Space,
      inputLines[3]!!.substring(9, 10) as Space,
    ],
    totalEnergy: 0
  };

  let states = [state];
  let minCostToWin = Infinity;
  const seen = new Set<string>();
  seen.add(toString(state));
  while (states.length > 0) {
    if (states.length > 700000) break;
    console.log(states.length);
    states = states
      .flatMap(s => allValidMoves(s))
      .filter(s => {
        seen.add(toString(s));
        if (hasWon(s)) {
          prettyPrint(s);
          minCostToWin = Math.min(minCostToWin, s.totalEnergy);
          return false;
        }
        return true;
      });
  }
  console.log('Part 1 ' + minCostToWin);
})();
