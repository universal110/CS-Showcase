import { executeProgram } from './interpreter';
import { parse } from './parser';
import type { ExecutionResult, MapDefinition, ProgramNode } from './types';
export const validateProgramStarts = (program: ProgramNode, map: MapDefinition): ExecutionResult[] =>
  map.starts.map(start => executeProgram(program, map, start));
export const validateAllStarts = (source: string, map: MapDefinition): ExecutionResult[] =>
  validateProgramStarts(parse(source), map);
