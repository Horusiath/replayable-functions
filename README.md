# replayable-functions

Proof of concept demo for making non-deterministic functions deterministic through WASM

Described in detail at [https://www.bartoszsypytkowski.com/wasm-replayable-functions/](https://www.bartoszsypytkowski.com/wasm-replayable-functions/).

Demo comes in two parts:
- **wasm-script**: Rust user script to be executed within WASM module. See [README](https://github.com/Horusiath/replayable-functions/blob/master/wasm-script/README.md) for compilation notes.
- **host**: a nodejs execution environment to setup and run WASM code.
