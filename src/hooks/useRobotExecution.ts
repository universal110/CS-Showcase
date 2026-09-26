import { useCallback, useEffect, useRef, useState } from 'react';
import { ROBOT_MAP, cloneState } from '../robot/map';
import { executeProgram } from '../robot/interpreter';
import { parse, toParseError } from '../robot/parser';
import { validateProgramStarts } from '../robot/validation';
import type { RobotState } from '../robot/types';

export interface ConsoleState {
  title: string;
  message: string;
  tone: 'neutral' | 'error' | 'success' | 'almost';
}
const initial = ROBOT_MAP.starts[0];
const ready: ConsoleState = { title: 'SYSTEM READY', message: 'Write your program, then run it.', tone: 'neutral' };

export function useRobotExecution(source: string) {
  const [state, setState] = useState<RobotState>(() => cloneState(initial));
  const [running, setRunning] = useState(false);
  const [activeLine, setActiveLine] = useState<number>();
  const [complete, setComplete] = useState(false);
  const [consoleState, setConsole] = useState<ConsoleState>(ready);
  // A stopped or unmounted run can never resume in a later generation.
  const generation = useRef(0);
  const busy = useRef(false);
  const cancelDelay = useRef<(() => void) | undefined>(undefined);
  const cancel = useCallback(() => {
    generation.current++;
    busy.current = false;
    cancelDelay.current?.();
    cancelDelay.current = undefined;
  }, []);
  useEffect(() => cancel, [cancel]);

  const reset = useCallback(() => {
    cancel();
    setRunning(false);
    setComplete(false);
    setState(cloneState(initial));
    setActiveLine(undefined);
    setConsole(ready);
  }, [cancel]);

  const stop = () => {
    cancel();
    setRunning(false);
    setActiveLine(undefined);
    setConsole({ title: 'PROGRAM STOPPED', message: 'Execution stopped by operator.', tone: 'neutral' });
  };

  const run = async () => {
    if (busy.current) return;
    cancel();
    const runId = generation.current;
    setComplete(false);
    setActiveLine(undefined);
    setState(cloneState(initial));
    let program;
    try { program = parse(source); }
    catch (error) {
      const detail = toParseError(error);
      setActiveLine(detail.line);
      setConsole({ title: `SYNTAX ERROR - LINE ${detail.line}`, message: detail.message, tone: 'error' });
      return;
    }
    const visualStart = ROBOT_MAP.starts[Math.floor(Math.random() * ROBOT_MAP.starts.length)];
    setState(cloneState(visualStart));
    busy.current = true;
    setRunning(true);
    setConsole({ title: 'PROGRAM RUNNING', message: `Test start: ${visualStart.id.replaceAll('-', ' ')}.`, tone: 'neutral' });
    try {
      const result = executeProgram(program, ROBOT_MAP, visualStart);
      for (const event of result.events) {
        if (generation.current !== runId) return;
        setActiveLine(event.line);
        setState(event.state);
        await new Promise<void>(resolve => {
          const timer = window.setTimeout(resolve, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 300);
          cancelDelay.current = () => { window.clearTimeout(timer); resolve(); };
        });
      }
      if (generation.current !== runId) return;
      setActiveLine(undefined);
      if (result.error) {
        setActiveLine(result.error.line);
        setConsole({ title: `PROGRAM TERMINATED - LINE ${result.error.line}`, message: result.error.message, tone: 'error' });
      } else if (!result.success) {
        const onTarget = result.state.position.row === ROBOT_MAP.target.row && result.state.position.col === ROBOT_MAP.target.col;
        setConsole({ title: onTarget ? 'ALMOST THERE' : 'MISSION INCOMPLETE', message: onTarget ? 'The robot reached the prayer area, but it is not facing the Qibla.' : 'The program ended before the robot completed its mission.', tone: 'almost' });
      } else {
        const all = validateProgramStarts(program, ROBOT_MAP);
        const failedIndex = all.findIndex(item => !item.success || item.error);
        if (failedIndex >= 0) {
          const failed = all[failedIndex];
          setConsole({ title: 'ONE TEST DID NOT PASS', message: `Start ${ROBOT_MAP.starts[failedIndex].id}: ${failed.error ? `line ${failed.error.line}: ${failed.error.message}` : 'The mission was incomplete.'} Use sensors to make your program adaptable.`, tone: 'almost' });
        } else {
          setComplete(true);
          setConsole({ title: 'ALL TESTS PASSED', message: `Mission complete from all ${all.length} starting states.`, tone: 'success' });
        }
      }
    } catch {
      if (generation.current === runId) setConsole({ title: 'PROGRAM TERMINATED', message: 'Unable to execute this program. Reset and check your code.', tone: 'error' });
    } finally {
      if (generation.current === runId) {
        busy.current = false;
        cancelDelay.current = undefined;
        setRunning(false);
      }
    }
  };
  return { state, running, activeLine, complete, consoleState, run, stop, reset };
}
