export type PawnShop = {
  "version": "0.1.0",
  "name": "pawn_shop",
  "instructions": [
    {
      "name": "createPawnShop",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "backend",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "fund",
      "accounts": [
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "drain",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updatePawnShop",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "publicKey"
        },
        {
          "name": "backend",
          "type": "publicKey"
        },
        {
          "name": "loanPeriod",
          "type": "u64"
        },
        {
          "name": "interestRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createLoan",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "backend",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loanNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "loanAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawLoan",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loanNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorityNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "paybackLoan",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loanNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "pawnShop",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "backend",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "totalLoanCount",
            "type": "u32"
          },
          {
            "name": "totalBalance",
            "type": "u64"
          },
          {
            "name": "loanPeriod",
            "type": "u64"
          },
          {
            "name": "interestRate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "loan",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "loanStartedTime",
            "type": "u64"
          },
          {
            "name": "loanAmount",
            "type": "u64"
          },
          {
            "name": "paybacked",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "FinishedPawnPeriod",
      "msg": "Finished Pawn Period"
    },
    {
      "code": 6001,
      "name": "NotFinishedPawnPeriod",
      "msg": "Not Finished Pawn Period"
    }
  ]
};

export const IDL: PawnShop = {
  "version": "0.1.0",
  "name": "pawn_shop",
  "instructions": [
    {
      "name": "createPawnShop",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "backend",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "fund",
      "accounts": [
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "drain",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updatePawnShop",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "publicKey"
        },
        {
          "name": "backend",
          "type": "publicKey"
        },
        {
          "name": "loanPeriod",
          "type": "u64"
        },
        {
          "name": "interestRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createLoan",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "backend",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loanNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "loanAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawLoan",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loanNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorityNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "paybackLoan",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pawnShop",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "loanNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "pawnShop",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "backend",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "totalLoanCount",
            "type": "u32"
          },
          {
            "name": "totalBalance",
            "type": "u64"
          },
          {
            "name": "loanPeriod",
            "type": "u64"
          },
          {
            "name": "interestRate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "loan",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "loanStartedTime",
            "type": "u64"
          },
          {
            "name": "loanAmount",
            "type": "u64"
          },
          {
            "name": "paybacked",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "FinishedPawnPeriod",
      "msg": "Finished Pawn Period"
    },
    {
      "code": 6001,
      "name": "NotFinishedPawnPeriod",
      "msg": "Not Finished Pawn Period"
    }
  ]
};
