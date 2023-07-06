export class CapturingContext {
    constructor() {
        this.isCapturing = true
        this.callPointers = {}
        this.calls = {}
        this.memory = null
    }

    capture(name, fn) {
        return ((...args) => {
            const ctx = this.calls[name] || []
            this.calls[name] = ctx
            if (this.isCapturing) {
                let result = fn(...args)
                //console.log(name, 'captured', result)
                ctx.push(result)
                return result
            } else {
                let ptr = this.callPointers[name] | 0
                let result = ctx[ptr++]
                this.callPointers[name] = ptr
                //console.log(name, 'replayed', result)
                return result
            }
        }).bind(this)
    }

    imports(env) {
        let bytes = new Uint8Array([])
        return {
            imports: { memory: this.memory },
            env: {
                read: (ptr, len) => {
                    if (bytes.byteLength === 0) {
                        const encoder = new TextEncoder()
                        const json = this.capture('read', env.read())
                        bytes = encoder.encode(json)
                    }
                    let written = (bytes.byteLength > len) ? len : bytes.byteLength
                    bytes = bytes.slice(0, written)
                    const view = new Uint8Array(this.memory.buffer, ptr, written)
                    view.set(bytes)
                },
                write: (ptr, len) => {
                    const view = new Uint8Array(this.memory.buffer, ptr, len)
                    const decoder = new TextDecoder(('utf-8'))
                    const json = decoder.decode(view)
                    this.capture('write', env.write(json))
                },
                sleep: this.capture('sleep', env.sleep),
            }
        }
    }

    snapshot() {
        return JSON.stringify(this.calls)
    }

    replay(snapshot) {
        this.calls = JSON.parse(snapshot)
        this.callPointers = {}
        this.isCapturing = false
    }
}