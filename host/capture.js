export class CapturingContext {
    constructor() {
        this.isCapturing = true
        this.callPointers = {}
        this.calls = {}
    }

    intercept(imports, functionNames) {
        for (let name of functionNames) {
            const fn = imports[name]
            imports[name] = (...args) => {
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