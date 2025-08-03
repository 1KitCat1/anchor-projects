use anchor_lang::prelude::*;

declare_id!("92hLvpULRPnRbVCKZgA7Ft9VbaSNwEvCrTauJsbBQW3V");

#[program]
pub mod expense_tracker {    
    use super::*;    

    pub fn initialize_expense(ctx: Context<InitializeExpense>) -> Result<()> {
        Ok(())
    }

    pub fn modify_expense(ctx: Context<ModifyExpense>) -> Result<()> {
        Ok(())
    }

    pub fn delete_expense(ctx: Context<DeleteExpense>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeExpense<'info> {
}

#[derive(Accounts)]
pub struct ModifyExpense<'info> {
}

#[derive(Accounts)]
pub struct DeleteExpense<'info> {
}

#[account]
pub struct ExpenseAccount {
    pub some_data: u64,
}