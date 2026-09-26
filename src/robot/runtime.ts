import type { Direction, Position, RobotState } from './types';
const directions: Direction[] = ['NORTH','EAST','SOUTH','WEST'];
export const rotate = (direction: Direction, amount: -1|1): Direction => directions[(directions.indexOf(direction) + amount + 4) % 4];
export const forwardPosition = (position: Position, direction: Direction): Position => {
  const delta: Record<Direction, Position> = { NORTH:{row:-1,col:0}, EAST:{row:0,col:1}, SOUTH:{row:1,col:0}, WEST:{row:0,col:-1} };
  return { row: position.row + delta[direction].row, col: position.col + delta[direction].col };
};
export const turnedState = (state: RobotState, amount: -1|1): RobotState => ({ ...state, direction: rotate(state.direction, amount) });
