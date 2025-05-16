/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/game_prototype.json`.
 */
export type GamePrototype = {
  address: '5LckBDcLSAbtSbfcdFRizWrREApZrjsvfM2quQsyvpFB';
  metadata: {
    name: 'gamePrototype';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'delegate';
      docs: ['Delegate the balance'];
      discriminator: [90, 147, 75, 178, 85, 88, 4, 137];
      accounts: [
        {
          name: 'payer';
          writable: true;
          signer: true;
        },
        {
          name: 'bufferPlayer';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [98, 117, 102, 102, 101, 114];
              },
              {
                kind: 'account';
                path: 'player';
              },
            ];
            program: {
              kind: 'const';
              value: [
                64,
                117,
                51,
                13,
                23,
                150,
                121,
                216,
                175,
                68,
                16,
                144,
                14,
                247,
                52,
                77,
                192,
                63,
                48,
                62,
                33,
                8,
                60,
                234,
                167,
                195,
                158,
                226,
                129,
                36,
                151,
                154,
              ];
            };
          };
        },
        {
          name: 'delegationRecordPlayer';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [100, 101, 108, 101, 103, 97, 116, 105, 111, 110];
              },
              {
                kind: 'account';
                path: 'player';
              },
            ];
            program: {
              kind: 'account';
              path: 'delegationProgram';
            };
          };
        },
        {
          name: 'delegationMetadataPlayer';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97,
                ];
              },
              {
                kind: 'account';
                path: 'player';
              },
            ];
            program: {
              kind: 'account';
              path: 'delegationProgram';
            };
          };
        },
        {
          name: 'player';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'payer';
              },
            ];
          };
        },
        {
          name: 'ownerProgram';
          address: '5LckBDcLSAbtSbfcdFRizWrREApZrjsvfM2quQsyvpFB';
        },
        {
          name: 'delegationProgram';
          address: 'DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'initializePlayer';
      docs: ['Initialize the payer balance with 20 tokens'];
      discriminator: [79, 249, 88, 177, 220, 62, 56, 128];
      accounts: [
        {
          name: 'player';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'user';
              },
            ];
          };
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'makeAction';
      discriminator: [7, 174, 154, 70, 80, 37, 84, 103];
      accounts: [
        {
          name: 'payer';
          writable: true;
          signer: true;
        },
        {
          name: 'player';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'payer';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'actionType';
          type: {
            defined: {
              name: 'playerAction';
            };
          };
        },
      ];
    },
    {
      name: 'processUndelegation';
      discriminator: [196, 28, 41, 206, 48, 37, 51, 167];
      accounts: [
        {
          name: 'baseAccount';
          writable: true;
        },
        {
          name: 'buffer';
        },
        {
          name: 'payer';
          writable: true;
        },
        {
          name: 'systemProgram';
        },
      ];
      args: [
        {
          name: 'accountSeeds';
          type: {
            vec: 'bytes';
          };
        },
      ];
    },
    {
      name: 'undelegate';
      docs: ['Undelegate the balance'];
      discriminator: [131, 148, 180, 198, 91, 104, 42, 238];
      accounts: [
        {
          name: 'payer';
          writable: true;
          signer: true;
        },
        {
          name: 'player';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'payer';
              },
            ];
          };
        },
        {
          name: 'magicProgram';
          address: 'Magic11111111111111111111111111111111111111';
        },
        {
          name: 'magicContext';
          writable: true;
          address: 'MagicContext1111111111111111111111111111111';
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'player';
      discriminator: [205, 222, 112, 7, 165, 155, 206, 218];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'insufficientBalance';
      msg: 'Insufficient balance for move action';
    },
  ];
  types: [
    {
      name: 'player';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'moveCounter';
            type: 'u64';
          },
          {
            name: 'attackCounter';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'playerAction';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'move';
          },
          {
            name: 'attack';
          },
        ];
      };
    },
  ];
};
