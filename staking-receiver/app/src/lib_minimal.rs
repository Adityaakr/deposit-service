#![no_std]
use gstd::{msg, prelude::*};

#[derive(Debug, Clone)]
pub struct DepositData {
    pub slot: u64,
    pub transaction_index: u32,
    pub receipt_rlp: Vec<u8>,
}

#[gstd::async_main]
async fn main() {
    let payload = msg::load_bytes().expect("Failed to load payload");
    
    // Try to decode as simple tuple
    if let Ok((slot, transaction_index, receipt_rlp)): Result<(u64, u32, Vec<u8>), _> = 
        parity_scale_codec::Decode::decode(&mut &payload[..]) {
        
        // Process the deposit
        process_deposit(slot, transaction_index, receipt_rlp);
        
    } else {
        // Try to decode as JSON string
        if let Ok(payload_str) = String::from_utf8(payload.clone()) {
            msg::reply_bytes(format!("Received JSON: {}", payload_str), 0)
                .expect("Failed to reply");
        } else {
            msg::reply_bytes("Failed to decode payload", 0)
                .expect("Failed to reply");
        }
    }
}

fn process_deposit(slot: u64, transaction_index: u32, receipt_rlp: Vec<u8>) {
    let user = msg::source();
    let deposit_amount = 1000000u128; // 1 USDC
    
    // Send success message
    let response = format!(
        "Deposit processed: slot={}, tx_index={}, receipt_len={}, user={:?}, amount={}",
        slot, transaction_index, receipt_rlp.len(), user, deposit_amount
    );
    
    msg::reply_bytes(response, 0).expect("Failed to reply");
}

#[no_mangle]
extern "C" fn init() {
    msg::reply_bytes("Minimal deposit receiver initialized", 0)
        .expect("Failed to reply");
}
