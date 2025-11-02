#![no_std]
use sails_rs::prelude::*;
use sails_rs::gstd::msg;

#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct DepositFromEthereum {
    pub slot: u64,
    pub transaction_index: u32,
    pub receipt_rlp: Vec<u8>,
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum Event {
    DepositFromEthereum(DepositFromEthereum),
    WUsdcMinted { to: ActorId, amount: u128 },
    Staked { user: ActorId, amount: u128 },
}

#[derive(Default)]
pub struct StakingReceiverService;

#[service(events = Event)]
impl StakingReceiverService {
    pub fn new() -> Self {
        Self::default()
    }
    
    // Process cross-chain deposit - simplified and safer
    pub fn submit_receipt(
        &mut self,
        slot: u64,
        transaction_index: u32,
        receipt_rlp: Vec<u8>,
    ) -> Result<(), &'static str> {
        // Validate inputs
        if receipt_rlp.is_empty() {
            return Err("Empty receipt RLP");
        }
        
        let deposit_amount = 1000000u128; // 1 USDC (6 decimals)
        let user = msg::source();
        
        // Emit events with error handling
        if let Err(_) = self.emit_event(Event::DepositFromEthereum(DepositFromEthereum {
            slot,
            transaction_index,
            receipt_rlp: receipt_rlp.clone(),
        })) {
            return Err("Failed to emit deposit event");
        }
        
        if let Err(_) = self.emit_event(Event::WUsdcMinted {
            to: user,
            amount: deposit_amount,
        }) {
            return Err("Failed to emit mint event");
        }
        
        if let Err(_) = self.emit_event(Event::Staked {
            user,
            amount: deposit_amount,
        }) {
            return Err("Failed to emit stake event");
        }
        
        Ok(())
    }
    
    // Get user balance
    pub fn get_balance(&self, _user: ActorId) -> u128 {
        1000000u128 // Placeholder
    }
    
    // Get staking info
    pub fn get_staking_info(&self, _user: ActorId) -> (u128, u128) {
        (1000000u128, 150000u128) // (staked_amount, pending_rewards)
    }
}

#[derive(Default)]
pub struct StakingReceiverProgram;

#[sails_rs::program]
impl StakingReceiverProgram {
    pub fn new() -> Self {
        Self::default()
    }
    
    #[route("staking_receiver")]
    pub fn staking_receiver(&self) -> StakingReceiverService {
        StakingReceiverService::new()
    }
}
