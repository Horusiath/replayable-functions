use std::str::from_utf8_unchecked;

extern "C" {
    /// Signal host that there's a string to write at address `ptr` and it's `len` bytes long.
    fn write(ptr: *const u8, len: u32);
    /// Signal host that we want to read the next message, which could be written into a buffer
    /// at a given address and provided length. Returns number of bytes written into a buffer.
    fn read(ptr: *mut u8, len: u32) -> u32;
    fn sleep(millis: f64);
}

fn send(data: &str) {
    let ptr = data.as_ptr();
    unsafe { write(ptr, data.len() as u32) }
}

const BUF_LEN: usize = 16;
static mut BUF: [u8; BUF_LEN] = [0u8; BUF_LEN];

fn receive() -> String {
    let mut result = String::new();
    while {
        unsafe {
            let ptr = BUF.as_mut_ptr();
            let n = read(ptr, BUF_LEN as u32) as usize;
            result.push_str(from_utf8_unchecked(&BUF[0..n]));
            n == BUF_LEN
        }
    } { }
    result
}

// Run now function 5 times, waiting 2 second between each call.
#[no_mangle]
pub unsafe extern "C" fn echo() {
    for _ in 0..5 {
        let timestamp = receive();
        sleep(2000.0);
        send(&format!("echo: {}", timestamp))
    }
}
