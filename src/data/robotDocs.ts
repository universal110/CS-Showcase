export const robotDocs = [
  {title:'MOVEMENT',items:[['MOVE();','Move forward one tile.'],['MOVE(n);','Move forward n tiles. n is a whole number from 1 to 99.'],['TURN_LEFT();','Rotate 90° left.'],['TURN_RIGHT();','Rotate 90° right.']]},
  {title:'SENSORS',items:[['FRONT_CLEAR()','Returns true if the tile ahead is walkable.'],['LEFT_CLEAR()','Returns true if the tile to the left is walkable.'],['RIGHT_CLEAR()','Returns true if the tile to the right is walkable.'],['ON_TARGET()','Returns true on the destination.'],['FACING_QIBLA()','Returns true when facing Qibla. Checks only; never rotates.']]},
  {title:'CONTROL FLOW',items:[['if (condition) { … }','Run only when true.'],['else { … }','After an if block: run when its condition is false.'],['while (condition) { … }','Repeat while true.']]},
  {title:'BOOLEAN OPERATORS',items:[['!','NOT — reverses true and false.'],['&&','AND — both conditions must be true.'],['||','OR — at least one condition must be true.'],['(condition)','Group conditions. Precedence: ! then && then ||.'],['true / false','Boolean values. Sensors return these values.']]},
  {title:'PROGRAM RULES',items:[['// comment','Text after // is ignored until the next line.'],['400 steps','Execution stops at the safety limit. Conditions and movements count as steps.'],['Input limits','12,000 characters, 2,000 tokens, 64 nesting levels.']]},
];
