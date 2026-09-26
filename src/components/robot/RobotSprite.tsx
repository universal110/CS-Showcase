import robot from '../../assets/characters/robot.png';import type{Direction}from'../../robot/types';
const rotation:Record<Direction,number>={NORTH:0,EAST:90,SOUTH:180,WEST:270};
export function RobotSprite({direction,status='idle'}:{direction:Direction;status?:'idle'|'running'|'error'|'success'}){return <div className={`robot-sprite robot-sprite--${status}`} style={{'--robot-turn':`${rotation[direction]}deg`} as React.CSSProperties}><img src={robot} alt={`Robot facing ${direction.toLowerCase()}`}/></div>}
