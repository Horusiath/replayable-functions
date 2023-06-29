Make sure that Web Assembly compile target is enabled:

```
rustup target add wasm32-unknown-unknown
```

then compile project using:

```
cargo build --target wasm32-unknown-unknown --release
```

You can always look at the generated content using [https://webassembly.github.io/wabt/demo/wasm2wat/](https://webassembly.github.io/wabt/demo/wasm2wat/)