import { isWalkable } from './map';
import { forwardPosition, rotate } from './runtime';
import type { MapDefinition, RobotState, SensorName } from './types';
export const readSensor = (name: SensorName, state: RobotState, map: MapDefinition): boolean => {
  if (name === 'ON_TARGET') return state.position.row === map.target.row && state.position.col === map.target.col;
  if (name === 'FACING_QIBLA') return state.direction === map.qibla;
  const direction = name === 'FRONT_CLEAR' ? state.direction : rotate(state.direction, name === 'LEFT_CLEAR' ? -1 : 1);
  return isWalkable(map, forwardPosition(state.position, direction));
};
