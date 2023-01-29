export type Auction = {
  "version": "0.1.0",
  "name": "auction",
  "instructions": [
    {
      "name": "createGlobal",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "global",
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
          "name": "pawnShopPool",
          "type": "publicKey"
        },
        {
          "name": "fee",
          "type": "u16"
        },
        {
          "name": "decreaseInterval",
          "type": "u16"
        },
        {
          "name": "decreasePercent",
          "type": "u16"
        },
        {
          "name": "minPercent",
          "type": "u16"
        }
      ]
    },
    {
      "name": "updateGlobal",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pawnShopPool",
          "type": "publicKey"
        },
        {
          "name": "fee",
          "type": "u16"
        },
        {
          "name": "decreaseInterval",
          "type": "u16"
        },
        {
          "name": "decreasePercent",
          "type": "u16"
        },
        {
          "name": "minPercent",
          "type": "u16"
        }
      ]
    },
    {
      "name": "createAuction",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auctionAta",
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
          "name": "startPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "bid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pawnShopPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auctionAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidderAta",
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
      "name": "withdraw",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auctionAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorAta",
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
      "name": "global",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "pawnShopPool",
            "type": "publicKey"
          },
          {
            "name": "fee",
            "type": "u16"
          },
          {
            "name": "decreaseInterval",
            "type": "u16"
          },
          {
            "name": "decreasePercent",
            "type": "u16"
          },
          {
            "name": "minPercent",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "auction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "startedTime",
            "type": "u64"
          },
          {
            "name": "startPrice",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": "publicKey"
          },
          {
            "name": "soldPrice",
            "type": "u64"
          },
          {
            "name": "earnedAmount",
            "type": "u64"
          },
          {
            "name": "finishedTime",
            "type": "u64"
          },
          {
            "name": "withdrawn",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAuction",
      "msg": "Invalid Auction"
    },
    {
      "code": 6001,
      "name": "AlreadyWithdrawn",
      "msg": "Already Withdrawn"
    }
  ]
};

export const IDL: Auction = {
  "version": "0.1.0",
  "name": "auction",
  "instructions": [
    {
      "name": "createGlobal",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "global",
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
          "name": "pawnShopPool",
          "type": "publicKey"
        },
        {
          "name": "fee",
          "type": "u16"
        },
        {
          "name": "decreaseInterval",
          "type": "u16"
        },
        {
          "name": "decreasePercent",
          "type": "u16"
        },
        {
          "name": "minPercent",
          "type": "u16"
        }
      ]
    },
    {
      "name": "updateGlobal",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pawnShopPool",
          "type": "publicKey"
        },
        {
          "name": "fee",
          "type": "u16"
        },
        {
          "name": "decreaseInterval",
          "type": "u16"
        },
        {
          "name": "decreasePercent",
          "type": "u16"
        },
        {
          "name": "minPercent",
          "type": "u16"
        }
      ]
    },
    {
      "name": "createAuction",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auctionAta",
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
          "name": "startPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "bid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pawnShopPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auctionAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidderAta",
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
      "name": "withdraw",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "global",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auctionAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorAta",
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
      "name": "global",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "pawnShopPool",
            "type": "publicKey"
          },
          {
            "name": "fee",
            "type": "u16"
          },
          {
            "name": "decreaseInterval",
            "type": "u16"
          },
          {
            "name": "decreasePercent",
            "type": "u16"
          },
          {
            "name": "minPercent",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "auction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "startedTime",
            "type": "u64"
          },
          {
            "name": "startPrice",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": "publicKey"
          },
          {
            "name": "soldPrice",
            "type": "u64"
          },
          {
            "name": "earnedAmount",
            "type": "u64"
          },
          {
            "name": "finishedTime",
            "type": "u64"
          },
          {
            "name": "withdrawn",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAuction",
      "msg": "Invalid Auction"
    },
    {
      "code": 6001,
      "name": "AlreadyWithdrawn",
      "msg": "Already Withdrawn"
    }
  ]
};
