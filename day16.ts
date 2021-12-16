import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day16.txt';

type Packet = {
  version: number,
  typeID: number,
  literalValue: string,
  operatorValue: {
    lengthTypeID: string,
    subPackets: Packet[]
  }
};

const sumVersions = (packet: Packet): number =>
  packet.version +
  packet.operatorValue.subPackets.reduce((sum, p) => sum + sumVersions(p), 0);

const evaluate = (packet: Packet): number =>
  ({
    4: () => +packet.literalValue,
    0: () => packet.operatorValue.subPackets
      .reduce((sum, p) => sum + evaluate(p), 0),
    1: () => packet.operatorValue.subPackets
      .reduce((product, p) => product * evaluate(p), 1),
    2: () => packet.operatorValue.subPackets
      .reduce((min, p) => Math.min(min, evaluate(p)), Infinity),
    3: () => packet.operatorValue.subPackets
      .reduce((max, p) => Math.max(max, evaluate(p)), -Infinity),
    5: () => Number(evaluate(packet.operatorValue.subPackets[0]!!) >
      evaluate(packet.operatorValue.subPackets[1]!!)),
    6: () => Number(evaluate(packet.operatorValue.subPackets[0]!!) <
      evaluate(packet.operatorValue.subPackets[1]!!)),
    7: () => Number(evaluate(packet.operatorValue.subPackets[0]!!) ===
      evaluate(packet.operatorValue.subPackets[1]!!))
  })[packet.typeID]!!();

const parsePacket = (
  bits: string, sub = false
): {packet: Packet, remaining: string} => {
  const version = parseInt(bits.substring(0, 3), 2);
  const typeID = parseInt(bits.substring(3, 6), 2);
  const outputPacket = {
    version, typeID, literalValue: '-1',
    operatorValue: {lengthTypeID: '-1', subPackets: []},
  } as Packet;
  bits = bits.substring(6);

  if (typeID === 4) { // Literal value
    let literal = '';
    let chunk = '';
    do {
      chunk = bits.substring(0, 5);
      bits = bits.substring(5);
      literal += chunk.substring(1, 5);
    } while (chunk.substring(0, 1) === '1');
    outputPacket.literalValue = parseInt(literal, 2).toString();
    if (!sub) bits = bits.substring(bits.length % 4);
    return {packet: outputPacket, remaining: bits};
  }

  else { // Operator
    outputPacket.operatorValue.lengthTypeID = bits.substring(0, 1);
    bits = bits.substring(1);
    let remainingPackets = 0;
    let remainingLength = 0;
    if (outputPacket.operatorValue.lengthTypeID === '0') {
      remainingLength = parseInt(bits.substring(0, 15), 2);
      bits = bits.substring(15);
    } else {
      remainingPackets = parseInt(bits.substring(0, 11), 2);
      bits = bits.substring(11);
    }
    while (remainingLength > 0 || remainingPackets > 0) {
      const {packet, remaining} = parsePacket(bits, true);
      remainingLength -= bits.length - remaining.length;
      remainingPackets--;
      outputPacket.operatorValue.subPackets.push(packet);
      bits = remaining;
    }
    if (!sub) bits = bits.substring(bits.length % 4);
    return {packet: outputPacket, remaining: bits};
  }
};

(async () => {
  const input = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('')
    .reduce((bits, char) =>
      bits + parseInt(char, 16).toString(2).padStart(4, '0'), ''
    );

  const {packet} = parsePacket(input);
  console.log('Part 1: ' + sumVersions(packet));
  console.log('Part 2: ' + evaluate(packet));
})();
