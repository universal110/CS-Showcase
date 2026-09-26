import { cloneState, isWalkable } from './map';
import { forwardPosition, rotate } from './runtime';
import { readSensor } from './sensors';
import type { ExecutionEvent, ExecutionResult, Expression, MapDefinition, ProgramNode, RobotState, RuntimeError, Statement } from './types';
class RuntimeFailure extends Error { constructor(public detail:RuntimeError){super(detail.message)} }
export const executeProgram = (program:ProgramNode,map:MapDefinition,start:RobotState,maxSteps=400,shouldStop=()=>false):ExecutionResult => {
  let state=cloneState(start);let steps=0;const events:ExecutionEvent[]=[];
  const tick=(line:number)=>{steps++;if(shouldStop())throw new RuntimeFailure({kind:'runtime',code:'STOPPED',line,message:'Program stopped.'});if(steps>maxSteps)throw new RuntimeFailure({kind:'runtime',code:'STEP_LIMIT',line,message:'Possible infinite loop detected.'});};
  const evaluate=(expr:Expression):boolean=>{tick(expr.line);if(expr.type==='Boolean')return expr.value;if(expr.type==='Sensor')return readSensor(expr.name,state,map);if(expr.type==='Not')return!evaluate(expr.operand);return expr.operator==='&&'?(evaluate(expr.left)&&evaluate(expr.right)):(evaluate(expr.left)||evaluate(expr.right));};
  const run=(statements:Statement[])=>{for(const stmt of statements){tick(stmt.line);if(stmt.type==='Command'){if(stmt.name==='TURN_LEFT'||stmt.name==='TURN_RIGHT'){state={...state,direction:rotate(state.direction,stmt.name==='TURN_LEFT'?-1:1)};events.push({type:'turn',state:cloneState(state),line:stmt.line});continue;}for(let i=0;i<(stmt.argument??1);i++){tick(stmt.line);const next=forwardPosition(state.position,state.direction);if(!isWalkable(map,next))throw new RuntimeFailure({kind:'runtime',code:'COLLISION',line:stmt.line,message:`Collision detected on line ${stmt.line}.`});state={...state,position:next};events.push({type:'move',state:cloneState(state),line:stmt.line});}}else if(stmt.type==='If'){run(evaluate(stmt.condition)?stmt.consequent:stmt.alternate);}else{while(evaluate(stmt.condition))run(stmt.body);}}};
  try{run(program.body);return{state,events,steps,success:readSensor('ON_TARGET',state,map)&&readSensor('FACING_QIBLA',state,map)}}catch(error){if(error instanceof RuntimeFailure)return{state,events,steps,error:error.detail,success:false};throw error;}
};
