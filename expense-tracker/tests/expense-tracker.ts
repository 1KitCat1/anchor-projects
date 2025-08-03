import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ExpenseTracker } from "../target/types/expense_tracker";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("expense_tracker", () => {  
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.ExpenseTracker as Program<ExpenseTracker>;
  const wallet = provider.wallet;

  it("should create an expense", async () => {
    const id = new anchor.BN(1);
    const amount = new anchor.BN(1000); // 1000 lamports
    const merchantName = "Walmart";

    // Get the expense account PDA
    const [expenseAccountPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("expense_account"),
        wallet.publicKey.toBuffer(),
        id.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // Create the expense
    await program.methods
      .initializeExpense(id, amount, merchantName)
      .accounts({
        authority: wallet.publicKey,
        expenseAccount: expenseAccountPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Fetch the created account
    const expenseAccount = await program.account.expenseAccount.fetch(expenseAccountPda);

    // Verify the data
    expect(expenseAccount.id.toNumber()).to.equal(id.toNumber());
    expect(expenseAccount.owner.toString()).to.equal(wallet.publicKey.toString());
    expect(expenseAccount.amount.toNumber()).to.equal(amount.toNumber());
    expect(expenseAccount.merchantName).to.equal(merchantName);
  });

  it("should modify an expense", async () => {
    const id = new anchor.BN(2);
    const initialAmount = new anchor.BN(500);
    const initialMerchantName = "Target";
    const newAmount = new anchor.BN(750);
    const newMerchantName = "Best Buy";

    // Get the expense account PDA
    const [expenseAccountPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("expense_account"),
        wallet.publicKey.toBuffer(),
        id.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // First create the expense
    await program.methods
      .initializeExpense(id, initialAmount, initialMerchantName)
      .accounts({
        authority: wallet.publicKey,
        expenseAccount: expenseAccountPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Then modify it
    await program.methods
      .modifyExpense(id, newAmount, newMerchantName)
      .accounts({
        authority: wallet.publicKey,
        expenseAccount: expenseAccountPda,
      })
      .rpc();

    // Fetch the modified account
    const expenseAccount = await program.account.expenseAccount.fetch(expenseAccountPda);

    // Verify the data was updated
    expect(expenseAccount.id.toNumber()).to.equal(id.toNumber());
    expect(expenseAccount.owner.toString()).to.equal(wallet.publicKey.toString());
    expect(expenseAccount.amount.toNumber()).to.equal(newAmount.toNumber());
    expect(expenseAccount.merchantName).to.equal(newMerchantName);
  });

  it("should delete an expense", async () => {
    const id = new anchor.BN(3);
    const amount = new anchor.BN(300);
    const merchantName = "Amazon";

    // Get the expense account PDA
    const [expenseAccountPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("expense_account"),
        wallet.publicKey.toBuffer(),
        id.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // First create the expense
    await program.methods
      .initializeExpense(id, amount, merchantName)
      .accounts({
        authority: wallet.publicKey,
        expenseAccount: expenseAccountPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Verify it was created
    const expenseAccount = await program.account.expenseAccount.fetch(expenseAccountPda);
    expect(expenseAccount.id.toNumber()).to.equal(id.toNumber());

    // Delete the expense
    await program.methods
      .deleteExpense(id)
      .accounts({
        authority: wallet.publicKey,
        expenseAccount: expenseAccountPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Verify the account was closed (should throw an error when trying to fetch)
    try {
      await program.account.expenseAccount.fetch(expenseAccountPda);
      expect.fail("Account should have been closed");
    } catch (error) {
      expect(error.message).to.include("Account does not exist");
    }
  });

  it("should fail when non-authority tries to modify expense", async () => {
    const id = new anchor.BN(4);
    const amount = new anchor.BN(200);
    const merchantName = "Starbucks";

    // Get the expense account PDA
    const [expenseAccountPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("expense_account"),
        wallet.publicKey.toBuffer(),
        id.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // Create the expense
    await program.methods
      .initializeExpense(id, amount, merchantName)
      .accounts({
        authority: wallet.publicKey,
        expenseAccount: expenseAccountPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Create a different keypair to try to modify
    const otherKeypair = anchor.web3.Keypair.generate();

    // Try to modify with different authority (should fail)
    try {
      await program.methods
        .modifyExpense(id, new anchor.BN(500), "Different Store")
        .accounts({
          authority: otherKeypair.publicKey,
          expenseAccount: expenseAccountPda,
        })
        .signers([otherKeypair])
        .rpc();
      expect.fail("Should have failed with different authority");
    } catch (error) {
      expect(error.message).to.include("Error");
    }
  });
});