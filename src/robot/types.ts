export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
export type TileType = 'WALL' | 'FLOOR' | 'TARGET';
export interface Position { row: number; col: number }
export interface RobotState { position: Position; direction: Direction }
export interface StartState extends RobotState { id: string }
export interface MapDefinition { width: number; height: number; tiles: TileType[][]; target: Position; qibla: Direction; starts: StartState[] }
export type SensorName = 'FRONT_CLEAR'|'LEFT_CLEAR'|'RIGHT_CLEAR'|'ON_TARGET'|'FACING_QIBLA';
export type CommandName = 'MOVE'|'TURN_LEFT'|'TURN_RIGHT';
export interface ProgramNode { type: 'Program'; body: Statement[] }
export type Statement = CommandNode | IfNode | WhileNode;
export interface CommandNode { type: 'Command'; name: CommandName; argument?: number; line: number }
export interface IfNode { type: 'If'; condition: Expression; consequent: Statement[]; alternate: Statement[]; line: number }
export interface WhileNode { type: 'While'; condition: Expression; body: Statement[]; line: number }
export type Expression = SensorNode | NotNode | BinaryNode | BooleanNode;
export interface SensorNode { type: 'Sensor'; name: SensorName; line: number }
export interface NotNode { type: 'Not'; operand: Expression; line: number }
export interface BinaryNode { type: 'Binary'; operator: '&&'|'||'; left: Expression; right: Expression; line: number }
export interface BooleanNode { type: 'Boolean'; value: boolean; line: number }
export interface ParseError { kind: 'parse'; line: number; message: string }
export type RuntimeErrorCode = 'COLLISION'|'STEP_LIMIT'|'STOPPED';
export interface RuntimeError { kind: 'runtime'; code: RuntimeErrorCode; line: number; message: string }
export type ExecutionEvent = { type: 'move'|'turn'|'check'; state: RobotState; line: number };
export interface ExecutionResult { state: RobotState; events: ExecutionEvent[]; steps: number; error?: RuntimeError; success: boolean }
