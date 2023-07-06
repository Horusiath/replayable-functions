import * as fs from 'fs'
import { CapturingContext } from './capture.js'

const bin = fs.readFileSync('../wasm-script/target/wasm32-unknown-unknown/release/wasm_script.wasm')

const identity = (args) => args

const env = {
    read: () => JSON.stringify(new Date().toISOString()),
    write: (json) => console.log(json),
    // sleep actively blocks current thread before returning
    sleep: (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0 ,0, Number(ms)),
}

// create a new WASM sandbox and run it using given capturing context
function run(context) {
    const module = new WebAssembly.Module(bin)
    const importObject = context.imports(env)
    const instance = new WebAssembly.Instance(module, importObject)
    context.memory = instance.exports.memory
    const { echo } = instance.exports

    let start = performance.now()
    echo()
    let end = performance.now()
    console.log('finished script in', end-start, 'ms')
}

// intercept functions to be imported into WASM module, so that we can record and replay their results
const context = new CapturingContext()

// run first time and record function calls
run(context)

/// run again - this time use function calls from previous run
const snapshot = context.snapshot()
console.log(snapshot)

const context2 = new CapturingContext()
context2.replay(snapshot)
run(context2)