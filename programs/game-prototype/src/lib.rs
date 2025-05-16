use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::{commit, delegate, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegateConfig;
use ephemeral_rollups_sdk::ephem::commit_and_undelegate_accounts;

declare_id!("5LckBDcLSAbtSbfcdFRizWrREApZrjsvfM2quQsyvpFB");

#[ephemeral]
#[program]
pub mod game_prototype {
    use super::*;

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        player.move_counter = 0;
        player.attack_counter = 0;
        msg!("Player initialized");
        Ok(())
    }

    pub fn delegate(ctx: Context<DelegatePlayer>) -> Result<()> {
        ctx.accounts.delegate_player(
            &ctx.accounts.payer,
            &[ctx.accounts.payer.key.as_ref()],
            DelegateConfig::default(),
        )?;
        msg!("Player delegated");
        Ok(())
    }

    pub fn make_action(ctx: Context<MakeAction>, action_type: PlayerAction) -> Result<()> {
        let player = &mut ctx.accounts.player;
        match action_type {
            PlayerAction::Move => player.move_counter += 1,
            PlayerAction::Attack => player.attack_counter += 1,
        }
        msg!(
            "Player {} performed action {}. {}: {}",
            player.key(),
            match action_type {
                PlayerAction::Move => "Move",
                PlayerAction::Attack => "Attack",
            },
            match action_type {
                PlayerAction::Move => "Move counter",
                PlayerAction::Attack => "Attack counter",
            },
            match action_type {
                PlayerAction::Move => player.move_counter,
                PlayerAction::Attack => player.attack_counter,
            }
        );

        Ok(())
    }

    pub fn undelegate(ctx: Context<UndelegatePlayer>) -> Result<()> {
        commit_and_undelegate_accounts(
            &ctx.accounts.payer,
            vec![&ctx.accounts.player.to_account_info()],
            &ctx.accounts.magic_context,
            &ctx.accounts.magic_program,
        )?;
        msg!("Player committed and undelegated");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(init, payer = user, space = 8+8+8, seeds = [user.key.as_ref()], bump)]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeAction<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, seeds = [payer.key.as_ref()], bump)]
    pub player: Account<'info, Player>,
    pub system_program: Program<'info, System>,
}

#[delegate]
#[derive(Accounts)]
pub struct DelegatePlayer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, del, seeds = [payer.key.as_ref()], bump)]
    pub player: AccountInfo<'info>,
}

#[commit]
#[derive(Accounts)]
pub struct UndelegatePlayer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, seeds = [payer.key.as_ref()], bump)]
    pub player: Account<'info, Player>,
}

#[account]
pub struct Player {
    pub move_counter: u64,
    pub attack_counter: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum PlayerAction {
    Move,
    Attack,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient balance for move action")]
    InsufficientBalance,
}
