import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ExpenseTracker } from "../target/types/expense_tracker";

describe("expense_tracker", () => {  
    const wallet = anchor.workspace.ExpenseTracker.provider.wallet;  
	
    // Configure the client to use the local cluster.  
    anchor.setProvider(anchor.AnchorProvider.env());  

    const program = anchor.workspace.ExpenseTracker as Program<ExpenseTracker>;  
    it("Load account with accountInfo", async () => {    
        // CREATE AN ACCOUNT NOT OWNED BY THE PROGRAM    
        const newKeypair = anchor.web3.Keypair.generate();    
        const tx = new anchor.web3.Transaction().add(      
            anchor.web3.SystemProgram.createAccount({        
                fromPubkey: wallet.publicKey,        
                newAccountPubkey: newKeypair.publicKey,        
                space: 16,        
                lamports: await anchor          
                    .getProvider()          				
                    .connection
                    .getMinimumBalanceForRentExemption(32),        		
                programId: program.programId,      
            })    
	);    

	await anchor.web3.sendAndConfirmTransaction(      
            anchor.getProvider().connection,      
            tx,      
            [wallet.payer, newKeypair]    
	);    

	// READ THE DATA IN THE ACCOUNT    
	await program.methods      
            .foo()      
            .accounts({ someAccount: newKeypair.publicKey })      
            .rpc();  
    });
});