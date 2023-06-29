import * as fs from 'fs'
import { CapturingContext } from './capture.js'

const bin = fs.readFileSync('../wasm-script/target/wasm32-unknown-unknown/release/wasm_script.wasm')

// create a new WASM sandbox and run it using given capturing context
function run(context, importObject) {
    context.intercept(importObject.env, ['now', 'sleep'])

    const module = new WebAssembly.Module(bin)
    const memory = new WebAssembly.Memory({initial: 2}) // size in pages
    importObject.imports = { memory }
    const instance = new WebAssembly.Instance(module, importObject)
    const { run_script } = instance.exports

    let start = performance.now()
    let result = run_script()
    let end = performance.now()
    console.log('finished script in', end-start, 'ms with result:', result)
}

function imports() {
    return  {
        env: {
            now: () => {
                return new Date().getTime()
            },
            sleep: (ms) => {
                Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0 ,0, Number(ms));
            },
        }
    }
}

// intercept functions to be imported into WASM module, so that we can record and replay their results
const context = new CapturingContext()

// run first time and record function calls
run(context, imports())

/// run again - this time use function calls from previous run
const snapshot = context.snapshot()
console.log(snapshot)

const context2 = new CapturingContext()
context2.replay(snapshot)
run(context2, imports())