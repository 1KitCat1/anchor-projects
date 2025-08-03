use anchor_lang::prelude::*;

declare_id!("92hLvpULRPnRbVCKZgA7Ft9VbaSNwEvCrTauJsbBQW3V");

#[program]
pub mod expense_tracker {    
    use super::*;    

    pub fn initialize_expense(ctx: Context<InitializeExpense>, id: u64, amount: u64, merchant_name: String) -> Result<()> {

        let expense_account = &mut ctx.accounts.expense_account;
        expense_account.id = id;
        expense_account.owner = ctx.accounts.authority.key();
        expense_account.amount = amount;
        expense_account.merchant_name = merchant_name;
        Ok(())
    }

    pub fn modify_expense(ctx: Context<ModifyExpense>, amount: u64, merchant_name: String) -> Result<()> {
        let expense_account = &mut ctx.accounts.expense_account;
        expense_account.amount = amount;
        expense_account.merchant_name = merchant_name;
        Ok(())
    }

    pub fn delete_expense(ctx: Context<DeleteExpense>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct InitializeExpense<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init, 
        payer = authority, 
        space = 8 + 8 + 32 + 8 + 100,
        seeds = [b"expense_account", authority.key().as_ref(), id.to_le_bytes().as_ref()],
        bump,
    )]
    pub expense_account: Account<'info, ExpenseAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct ModifyExpense<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"expense_account", authority.key().as_ref(), id.to_le_bytes().as_ref()],
        bump,
    )]
    pub expense_account: Account<'info, ExpenseAccount>,
}

#[derive(Accounts)]
pub struct DeleteExpense {
    
}

#[account]
pub struct ExpenseAccount {
    pub id: u64,
    pub owner: Pubkey,
    pub amount: u64,
    pub merchant_name: String,
}