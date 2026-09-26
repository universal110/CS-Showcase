import type { MapDefinition, Position, RobotState, TileType } from './types';
const rows = [
  '#######',
  '#####T#',
  '#####.#',
  '#...#.#',
  '#.#.#.#',
  '#.#...#',
  '#######',
];
const target: Position = { row: 1, col: 5 };
export const ROBOT_MAP: MapDefinition = {
  width: 7, height: 7, target, qibla: 'NORTH',
  tiles: rows.map((row) => [...row].map((cell): TileType => cell === '#' ? 'WALL' : cell === 'T' ? 'TARGET' : 'FLOOR')),
  starts: [
    { id: 'south-entry', position: { row: 5, col: 1 }, direction: 'EAST' },
    { id: 'middle-turn', position: { row: 3, col: 3 }, direction: 'SOUTH' },
    { id: 'lower-corridor', position: { row: 5, col: 4 }, direction: 'WEST' },
    { id: 'upper-entry', position: { row: 3, col: 1 }, direction: 'NORTH' },
  ],
};
export const cloneState = (state: RobotState): RobotState => ({ position: { ...state.position }, direction: state.direction });
export const isWalkable = (map: MapDefinition, position: Position): boolean => map.tiles[position.row]?.[position.col] !== undefined && map.tiles[position.row][position.col] !== 'WALL';
