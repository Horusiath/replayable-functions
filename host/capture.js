export class CapturingContext {
    constructor() {
        this.isCapturing = true
        this.callPointers = {}
        this.calls = {}
        this.memory = null
    }

    snapshot() {
        return JSON.stringify(this.calls)
    }

    replay(snapshot) {
        this.calls = JSON.parse(snapshot)
        this.callPointers = {}
        this.isCapturing = false
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
        const read = this.capture('read', env.read)
        const write = env.write
        //const write = this.capture('write', env.write)
        const sleep = this.capture('sleep', env.sleep)
        
        let buf = null
        let readIdx = 0
        return {
            env: {
                read: (ptr, len) => {
                    if (buf === null || readIdx === buf.byteLength) {
                        // there's no previous message, read new one
                        const json = read()
                        const encoder = new TextEncoder()
                        buf = encoder.encode(json)
                        readIdx = 0
                    }
                    let n = Math.min(len, buf.byteLength - readIdx)
                    const slice = buf.slice(readIdx, readIdx + n)
                    readIdx += n
                    const view = new Uint8Array(this.memory.buffer, ptr, n)
                    view.set(slice)
                    return n
                },
                write: (ptr, len) => {
                    const view = new Uint8Array(this.memory.buffer, ptr, len)
                    const decoder = new TextDecoder(('utf-8'))
                    const json = decoder.decode(view)
                    write(json)
                },
                sleep,
            }
        }
    }
}