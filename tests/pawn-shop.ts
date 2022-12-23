import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PawnShop } from "../target/types/pawn_shop";

describe("pawn-shop", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PawnShop as Program<PawnShop>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
