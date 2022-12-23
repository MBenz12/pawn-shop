use anchor_lang::prelude::*;

#[account]
pub struct PawnShop {
    pub authority: Pubkey,
    pub backend: Pubkey,
    pub name: String,
    pub bump: u8,
    pub total_loan_count: u32,
    pub total_balance: u64,
    pub loan_period: u64,
    pub interest_rate: u64,
}

impl PawnShop {
    pub const LEN: usize = std::mem::size_of::<PawnShop>();
}

#[account]
pub struct Loan {
    pub bump: u8,
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
    pub loan_started_time: u64,
    pub loan_amount: u64,
    pub paybacked: bool,
}

impl Loan {
    pub const LEN: usize = std::mem::size_of::<Loan>();
}

#[error_code]
pub enum CustomError {
    #[msg("Finished Pawn Period")]
    FinishedPawnPeriod,
    #[msg("Not Finished Pawn Period")]
    NotFinishedPawnPeriod,
}