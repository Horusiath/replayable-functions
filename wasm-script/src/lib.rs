extern "C" {
    fn now() -> f64;
    fn sleep(millis: f64);
}

// Run now function 5 times, waiting 2 second between each call.
#[no_mangle]
pub unsafe extern "C" fn run_script() -> f64 {
    let mut timestamp: f64 = 0.0;
    for i in 0..5 {
        timestamp = timestamp.max(now());
        sleep(2000.0);
    }
    timestamp
}
