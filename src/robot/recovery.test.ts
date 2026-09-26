import { describe, expect, it } from 'vitest';
import { lex } from './lexer';
import { parse } from './parser';
import { executeProgram } from './interpreter';
import { ROBOT_MAP } from './map';
import { readSensor } from './sensors';
import { validateAllStarts } from './validation';
import { KNOWN_SOLUTION } from '../../tests/fixtures/robotSolution';

const start=ROBOT_MAP.starts[0];
const run=(code:string)=>executeProgram(parse(code),ROBOT_MAP,start);
describe('recovery regression coverage',()=>{
  it.each(ROBOT_MAP.starts)('solves $id', state=>{
    const result=executeProgram(parse(KNOWN_SOLUTION),ROBOT_MAP,state);
    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
    expect(result.steps).toBeLessThanOrEqual(400);
  });
  it('lexes comments and preserves source lines',()=>{
    expect(lex('// comment\nMOVE(2);')[0]).toMatchObject({value:'MOVE',line:2});
  });
  it.each(['MOVE()','MOVE(0);','MOVE(-1);','MOVE(1.5);','MOVE(100);','TURN_LEFT(2);','if (true) MOVE();','while (true) {','if (BOGUS()) {}','MOVE(); @','else {}'])('rejects invalid source %s',code=>expect(()=>parse(code)).toThrow());
  it('bounds input, tokens and nesting',()=>{
    expect(()=>parse(' '.repeat(12001))).toThrow();
    expect(()=>parse('MOVE();'.repeat(501))).toThrow();
    expect(()=>parse('if ('+'!'.repeat(100)+'true) {}')).toThrow();
    expect(()=>parse('while(true){'.repeat(100)+'}'.repeat(100))).toThrow();
  });
  it('executes integer moves and both rotations without mutating start',()=>{
    const before=JSON.stringify(start);
    expect(run('TURN_LEFT(); MOVE(2); TURN_RIGHT();').state).toEqual({position:{row:3,col:1},direction:'EAST'});
    expect(JSON.stringify(start)).toBe(before);
    expect(run('').state).toEqual({position:start.position,direction:start.direction});
  });
  it('reads all sensors and orientation independently of location',()=>{
    expect(readSensor('RIGHT_CLEAR',start,ROBOT_MAP)).toBe(false);
    expect(readSensor('RIGHT_CLEAR',{position:{row:3,col:1},direction:'NORTH'},ROBOT_MAP)).toBe(true);
    expect(readSensor('ON_TARGET',{position:ROBOT_MAP.target,direction:'SOUTH'},ROBOT_MAP)).toBe(true);
    expect(readSensor('FACING_QIBLA',start,ROBOT_MAP)).toBe(false);
    expect(readSensor('FACING_QIBLA',{...start,direction:'NORTH'},ROBOT_MAP)).toBe(true);
  });
  it('honors precedence, parentheses, NOT and else',()=>{
    expect(run('if (true || false && false) { TURN_LEFT(); }').state.direction).toBe('NORTH');
    expect(run('if ((true || false) && false) { TURN_LEFT(); } else { TURN_RIGHT(); }').state.direction).toBe('SOUTH');
    expect(run('if (!(true || false)) { MOVE(); }').error).toBeUndefined();
  });
  it('terminates empty loops and supports cancellation',()=>{
    expect(run('while (true) {}').error?.code).toBe('STEP_LIMIT');
    expect(executeProgram(parse('MOVE();'),ROBOT_MAP,start,400,()=>true).error?.code).toBe('STOPPED');
  });
  it('reports collision lines and preserves valid movement events',()=>{
    const result=run('TURN_LEFT();\nMOVE(3);');
    expect(result.error).toMatchObject({code:'COLLISION',line:2});
    expect(result.events).toHaveLength(3);
  });
  it('requires target AND Qibla and rejects a lucky fixed route',()=>{
    expect(executeProgram(parse(''),ROBOT_MAP,{position:ROBOT_MAP.target,direction:'SOUTH'}).success).toBe(false);
    expect(executeProgram(parse(''),ROBOT_MAP,{position:ROBOT_MAP.target,direction:'NORTH'}).success).toBe(true);
    const results=validateAllStarts('TURN_LEFT(); MOVE(2); TURN_RIGHT(); MOVE(2); TURN_RIGHT(); MOVE(2); TURN_LEFT(); MOVE(2); TURN_LEFT(); MOVE(4);',ROBOT_MAP);
    expect(results[0].success).toBe(true);
    expect(results.every(result=>result.success)).toBe(false);
  });
});

