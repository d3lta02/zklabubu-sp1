use wasm_bindgen::prelude::*;

// For debugging in case of panic
pub fn set_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

// For logging to the console
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

// Generate random number
pub fn random(min: f64, max: f64) -> f64 {
    let random_val = js_sys::Math::random();
    min + random_val * (max - min)
}

// Our own console.log macro
#[macro_export]
macro_rules! console_log {
    ($($t:tt)*) => (crate::utils::log(&format_args!($($t)*).to_string()))
}