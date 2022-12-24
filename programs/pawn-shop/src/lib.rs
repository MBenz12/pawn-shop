mod ins;
mod state;
mod constants;

use anchor_lang::{
    prelude::*,
    system_program,
    solana_program::clock::Clock,
};
use anchor_spl::token::{transfer, Transfer};

use crate::ins::*;
use crate::state::*;
use crate::constants::*;

declare_id!("DR2xyqzhkQ92R5EmgyRu7mnwcdi1PsVa83tcusqKRMjX");

#[program]
pub mod pawn_shop {
    use super::*;

    pub fn create_pawn_shop(ctx: Context<CreatePawnShop>, name: String, backend: Pubkey) -> Result<()> {
        let pawn_shop = &mut ctx.accounts.pawn_shop;

        pawn_shop.name = name;
        pawn_shop.authority = ctx.accounts.authority.key();
        pawn_shop.backend = backend;
        pawn_shop.total_balance = 0;
        pawn_shop.total_loan_count = 0;
        pawn_shop.loan_period = 7 * DAY_SECOND;
        pawn_shop.interest_rate = 1 * PERCENT_DECIMAL;
        pawn_shop.bump = *ctx.bumps.get("pawn_shop").unwrap();
        
        Ok(())
    }

    pub fn fund(ctx: Context<Fund>, amount: u64) -> Result<()> {
        let pawn_shop = &mut ctx.accounts.pawn_shop;

        pawn_shop.total_balance = pawn_shop.total_balance.checked_add(amount).unwrap();

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.funder.to_account_info(),
                to: ctx.accounts.pawn_shop.to_account_info(),
            }
        );
        system_program::transfer(cpi_context, amount)?;

        Ok(())
    }

    pub fn drain(ctx: Context<Drain>) -> Result<()> {
        let pawn_shop = &ctx.accounts.pawn_shop;
        let amount = pawn_shop.total_balance;
        **ctx.accounts.pawn_shop.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;

        let pawn_shop = &mut ctx.accounts.pawn_shop;
        pawn_shop.total_balance = 0;

        Ok(())
    }

    pub fn update_pawn_shop(ctx: Context<UpdatePawnShop>, new_authority: Pubkey, backend: Pubkey, loan_period: u64, interest_rate: u64) -> Result<()> {
        let pawn_shop = &mut ctx.accounts.pawn_shop;
        
        pawn_shop.authority = new_authority;
        pawn_shop.backend = backend;
        pawn_shop.loan_period = loan_period;
        pawn_shop.interest_rate = interest_rate;
        
        Ok(())
    }

    pub fn create_loan(ctx: Context<CreateLoan>, loan_amount: u64) -> Result<()> {
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                authority: ctx.accounts.owner.to_account_info(),
                from: ctx.accounts.owner_nft_ata.to_account_info(),
                to: ctx.accounts.loan_nft_ata.to_account_info(),
            },
        );

        transfer(cpi_context, 1)?;

        msg!("pawn shop balance: {:?}", **ctx.accounts.pawn_shop.to_account_info().try_borrow_mut_lamports()?);
        msg!("loan amount: {:?}", loan_amount);

        **ctx.accounts.pawn_shop.to_account_info().try_borrow_mut_lamports()? -= loan_amount;
        **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += loan_amount;

        let loan = &mut ctx.accounts.loan;

        loan.bump = *ctx.bumps.get("loan").unwrap();
        loan.owner = ctx.accounts.owner.key();
        loan.nft_mint = ctx.accounts.nft_mint.key();
        loan.loan_amount = loan_amount;
        loan.paybacked = false;

        loan.loan_started_time = now();
        
        let pawn_shop = &mut ctx.accounts.pawn_shop;
        
        pawn_shop.total_loan_count = pawn_shop.total_loan_count.checked_add(1).unwrap();
        pawn_shop.total_balance = pawn_shop.total_balance.checked_sub(loan_amount).unwrap();

        Ok(())
    }

    pub fn withdraw_loan(ctx: Context<WithdrawLoan>) -> Result<()> {
        let pawn_shop = &mut ctx.accounts.pawn_shop;
        let loan = &ctx.accounts.loan;
        
        require!(loan.loan_started_time + pawn_shop.loan_period < now(), CustomError::NotFinishedPawnPeriod);

        let nft_mint = loan.nft_mint;
        let pawn_shop_key = pawn_shop.key();
        let bump = loan.bump;
        let seeds = &[
            LOAN_SEED.as_ref(),
            pawn_shop_key.as_ref(),
            nft_mint.as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                authority: ctx.accounts.loan.to_account_info(),
                from: ctx.accounts.loan_nft_ata.to_account_info(),
                to: ctx.accounts.authority_nft_ata.to_account_info(),
            },
            signer,
        );

        transfer(cpi_context, 1)?;

        let loan = &mut ctx.accounts.loan;
        loan.paybacked = false;
        
        pawn_shop.total_loan_count = pawn_shop.total_loan_count.checked_sub(1).unwrap();

        Ok(())
    }

    pub fn payback_loan(ctx: Context<PaybackLoan>) -> Result<()> {
        let pawn_shop = &ctx.accounts.pawn_shop;
        let loan = &ctx.accounts.loan;

        require!(loan.loan_started_time + pawn_shop.loan_period >= now(), CustomError::FinishedPawnPeriod);

        let pawned_period = now().checked_sub(loan.loan_started_time).unwrap();
        let mut pawned_day = pawned_period.checked_div(DAY_SECOND).unwrap();
        if pawned_period % DAY_SECOND > 0 {
            pawned_day = pawned_day.checked_add(1).unwrap();
        }
        let interest_amount = loan.loan_amount
            .checked_mul(pawn_shop.interest_rate).unwrap()
            .checked_mul(pawned_day).unwrap()
            .checked_div(100 * PERCENT_DECIMAL).unwrap();
        
        let payback_amount = loan.loan_amount.checked_add(interest_amount).unwrap();
        
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.pawn_shop.to_account_info(),
            }
        );
        system_program::transfer(cpi_context, payback_amount)?;

        let nft_mint = loan.nft_mint;
        let pawn_shop_key = pawn_shop.key();
        let bump = loan.bump;
        let seeds = &[
            LOAN_SEED.as_ref(),
            pawn_shop_key.as_ref(),
            nft_mint.as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                authority: ctx.accounts.loan.to_account_info(),
                from: ctx.accounts.loan_nft_ata.to_account_info(),
                to: ctx.accounts.owner_nft_ata.to_account_info(),
            },
            signer,
        );

        transfer(cpi_context, 1)?;

        let loan = &mut ctx.accounts.loan;
        loan.paybacked = true;

        let pawn_shop = &mut ctx.accounts.pawn_shop;

        pawn_shop.total_loan_count = pawn_shop.total_loan_count.checked_sub(1).unwrap();
        pawn_shop.total_balance = pawn_shop.total_balance.checked_add(payback_amount).unwrap();

        Ok(())
    }
}

fn now() -> u64 {
    Clock::get().unwrap().unix_timestamp.try_into().unwrap()
}