use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreatePawnShop<'info>
{
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = PawnShop::LEN + 8,
        seeds = [
            PAWN_SHOP_SEED.as_bytes(),
            name.as_bytes(),
        ],
        bump
    )]
    pub pawn_shop: Box<Account<'info, PawnShop>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Fund<'info>
{
    #[account(mut)]
    pub funder: Signer<'info>,

    #[account(
        mut,
        seeds = [
            PAWN_SHOP_SEED.as_bytes(),
            pawn_shop.name.as_bytes(),
        ],
        bump = pawn_shop.bump,
    )]
    pub pawn_shop: Account<'info, PawnShop>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePawnShop<'info>
{
    #[account(mut, address = pawn_shop.authority)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            PAWN_SHOP_SEED.as_bytes(),
            pawn_shop.name.as_bytes(),
        ],
        bump = pawn_shop.bump,
    )]
    pub pawn_shop: Account<'info, PawnShop>,
}

#[derive(Accounts)]
pub struct CreateLoan<'info>
{
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(address = pawn_shop.backend)]
    pub backend: Signer<'info>,

    #[account(
        mut,
        seeds = [
            PAWN_SHOP_SEED.as_bytes(),
            pawn_shop.name.as_bytes(),
        ],
        bump = pawn_shop.bump,
    )]
    pub pawn_shop: Account<'info, PawnShop>,

    #[account(
        init,
        payer = owner,
        space = Loan::LEN + 8,
        seeds = [
            LOAN_SEED.as_bytes(),
            pawn_shop.key().as_ref(),
            nft_mint.key().as_ref(),
        ],
        bump
    )]
    pub loan: Box<Account<'info, Loan>>,

    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = owner,
    )]
    pub owner_nft_ata: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = nft_mint,
        associated_token::authority = loan,
    )]
    pub loan_nft_ata: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct WithdrawLoan<'info>
{
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            PAWN_SHOP_SEED.as_bytes(),
            pawn_shop.name.as_bytes(),
        ],
        bump = pawn_shop.bump,
    )]
    pub pawn_shop: Account<'info, PawnShop>,

    #[account(
        mut,
        seeds = [
            LOAN_SEED.as_bytes(),
            pawn_shop.key().as_ref(),
            nft_mint.key().as_ref(),
        ],
        bump = loan.bump,
    )]
    pub loan: Account<'info, Loan>,

    #[account(mut, address = loan.nft_mint)]
    pub nft_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = loan,
    )]
    pub loan_nft_ata: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = nft_mint,
        associated_token::authority = authority,
    )]
    pub authority_nft_ata: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PaybackLoan<'info>
{
    #[account(mut, address = loan.owner)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [
            PAWN_SHOP_SEED.as_bytes(),
            pawn_shop.name.as_bytes(),
        ],
        bump = pawn_shop.bump,
    )]
    pub pawn_shop: Account<'info, PawnShop>,

    #[account(
        mut,
        seeds = [
            LOAN_SEED.as_bytes(),
            pawn_shop.key().as_ref(),
            loan.nft_mint.key().as_ref(),
        ],
        bump = loan.bump,
    )]
    pub loan: Account<'info, Loan>,

    #[account(
        mut,
        associated_token::mint = loan.nft_mint,
        associated_token::authority = loan,
    )]
    pub loan_nft_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = loan.nft_mint,
        associated_token::authority = owner,
    )]
    pub owner_nft_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,
}