'use client';

// Ambient drone — currently disabled (sine-wave version sounded like white noise).
// Stub kept so duck()/unduck() calls throughout the codebase remain safe no-ops.
// Replace start() with a real ambient audio file implementation when ready.

class AmbientEngine {
  get isRunning(): boolean { return false; }
  start():  void {}
  stop():   void {}
  duck():   void {}
  unduck(): void {}
}

export const ambientEngine = new AmbientEngine();
