// Development/test fixture only. Never import into application modules.
export const KNOWN_SOLUTION = `while (!ON_TARGET()) {
  if (RIGHT_CLEAR()) {
    TURN_RIGHT();
    MOVE();
  } else {
    if (FRONT_CLEAR()) {
      MOVE();
    } else {
      TURN_LEFT();
    }
  }
}
while (!FACING_QIBLA()) {
  TURN_RIGHT();
}`;
