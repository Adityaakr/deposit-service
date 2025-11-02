#![no_std]
use sails_rs::prelude::*;

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

pub struct CrossChainStakingService;

#[service(events = Event)]
impl CrossChainStakingService {
    pub fn submit_receipt(
        &mut self,
        slot: u64,
        transaction_index: u32,
        receipt_rlp: Vec<u8>,
    ) {
        // Simplified processing - in real implementation would parse receipt
        let deposit_amount = 1000000u128; // 1 USDC (6 decimals)
        let user = msg::source();
        
        // Emit events
        self.emit_event(Event::DepositFromEthereum(DepositFromEthereum {
            slot,
            transaction_index,
            receipt_rlp,
        }))
        .expect("Failed to emit deposit event");
        
        self.emit_event(Event::WUsdcMinted {
            to: user,
            amount: deposit_amount,
        })
        .expect("Failed to emit mint event");
        
        self.emit_event(Event::Staked {
            user,
            amount: deposit_amount,
        })
        .expect("Failed to emit stake event");
    }
    
    pub fn get_balance(&self, user: ActorId) -> u128 {
        // Placeholder - would return actual balance
        1000000u128
    }
}

pub struct CrossChainStakingProgram;

#[sails_rs::program]
impl CrossChainStakingProgram {
    pub fn new() -> Self {
        Self
    }
    
    pub fn staking_service(&self) -> CrossChainStakingService {
        CrossChainStakingService
    }
}
