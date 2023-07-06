import * as fs from 'fs'
import { CapturingContext } from './capture.js'

const bin = fs.readFileSync('../wasm-script/target/wasm32-unknown-unknown/release/wasm_script.wasm')

const identity = (args) => args

const env = {
    read: () => JSON.stringify(new Date().toISOString()),
    write: (json) => console.log(JSON.parse(json)),
    // sleep actively blocks current thread before returning
    sleep: (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0 ,0, Number(ms)),
}

// create a new WASM sandbox and run it using given capturing context
function run(context) {
    const module = new WebAssembly.Module(bin)
    const memory = new WebAssembly.Memory({initial: 2}) // size in pages
    context.memory = memory
    const importObject = context.imports(env)
    const instance = new WebAssembly.Instance(module, importObject)
    const { echo } = instance.exports

    let start = performance.now()
    let result = echo()
    let end = performance.now()
    console.log('finished script in', end-start, 'ms with result:', new Date(result))
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
run(context2, imports())