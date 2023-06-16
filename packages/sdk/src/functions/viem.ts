import {
  getContract,
  getContractAddress,
  concat,
  PublicClient,
  WalletClient,
  encodeFunctionData,
  encodeAbiParameters,
  toHex,
  pad
} from "viem"

import { erc6551AccountAbi, erc6551RegistryAbi } from '../../abis'
import { erc6551AccountImplementationAddress, erc6551RegistryAddress } from "../constants"
import { addressToUint8Array } from "../utils"

export { erc6551AccountAbi, erc6551RegistryAbi }

/**
 * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
 * @internal
 */
export async function getAccount(
  tokenContract: string,
  tokenId: string,
  client: PublicClient
): Promise<`0x${string}`> {

  const registry = getContract({
    address: erc6551RegistryAddress,
    abi: erc6551RegistryAbi,
    publicClient: client as PublicClient,
  })

  const chainId = await client.getChainId()

  const account = await registry.read.account([
    erc6551AccountImplementationAddress,
    chainId,
    tokenContract,
    tokenId,
    0,
  ])

  return account as `0x${string}`
}

/**
 * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
 * @internal
 */
export async function prepareCreateAccount(
  tokenContract: string,
  tokenId: string,
  chainId: number // @BJ TODO: confirm w/ Jayden (not in spec)
): Promise<{
  to: `0x${string}`
  value: bigint
  data: string
}> {
  
  const initData = encodeFunctionData({
    abi: [
      {
        inputs: [],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "initialize",
  })

  return {
    to: erc6551RegistryAddress as `0x${string}`,
    value: BigInt(0),
    data: encodeFunctionData({
      abi: erc6551RegistryAbi,
      functionName: "createAccount",
      args: [
        erc6551AccountImplementationAddress,
        chainId,
        tokenContract,
        tokenId,
        0,
        initData,
      ],
    }),
  }

}

/**
 * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
 * @internal
 */
export async function createAccount(
  tokenContract: string,
  tokenId: string,
  client: WalletClient,
): Promise<`0x${string}`> {
  const registry = getContract({
    address: erc6551RegistryAddress,
    abi: erc6551RegistryAbi,
    walletClient: client,
  })

  const chainId = await client.getChainId()

  const initData = encodeFunctionData({
    abi: [
      {
        inputs: [],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "initialize",
  })

  return registry.write.createAccount([
    erc6551AccountImplementationAddress,
    chainId,
    tokenContract,
    tokenId,
    0,
    initData,
  ])
}

/**
 * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
 * @internal
 */
export async function prepareExecuteCall(
  account: string,
  to: string,
  value: bigint,
  data: string
): Promise<{
  to: `0x${string}`
  value: bigint
  data: `0x${string}`
}> {
  return {
    to: account as `0x${string}`,
    value,
    data: encodeFunctionData({
      abi: erc6551AccountAbi,
      functionName: "executeCall",
      args: [
        to as `0x${string}`,
        value,
        data as `0x${string}`
      ],
    }),
  }
}

/**
 * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
 * @internal
 */
export async function executeCall(
  account: string,
  to: string,
  value: bigint,
  data: string,
  client: WalletClient
) {
  const registry = getContract({
    address: account as `0x${string}`,
    abi: erc6551AccountAbi,
    walletClient: client,
  })

  return registry.write.executeCall([
    to as `0x${string}`,
    value,
    data as `0x${string}`,
  ])
}

/**
 * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
 * @internal
 */
export function computeAccount(
  tokenContract: string,
  tokenId: string,
  chainId: number,
): `0x${string}` {
  const code = getCreationCode(
    erc6551AccountImplementationAddress,
    chainId,
    tokenContract,
    tokenId,
    "0"
  )
  // const codeHash = keccak256(code)
  // const saltHex = utils.hexZeroPad(BigNumber.from("0").toHexString(), 32)
  
  const bigIntZero = BigInt("0").toString(16) as `0x${string}`
  const saltHex = pad(bigIntZero, { size: 32 })
  
  // return utils.getCreate2Address(
  //   erc6551RegistryAddress,
  //   saltHex,
  //   codeHash,
  // )

  return getContractAddress({
    bytecode: code,
    from: erc6551RegistryAddress,
    opcode: 'CREATE2',
    salt: saltHex,
  })

}

// export function getCreationCode(
//   implementation_: string,
//   chainId_: number,
//   tokenContract_: string,
//   tokenId_: string,
//   salt_: string,
// ): Uint8Array {
//   // const types = ["uint256", "uint256", "address", "uint256"] // from ethers impl
//   const types =       [
//     { type: 'uint256'},
//     { type: 'uint256'},
//     { type: 'address'},
//     { type: 'uint256'}
//   ]
//   const values = [salt_, BigInt(chainId_), tokenContract_, tokenId_]

//   const hexCreationCode = concat([
//     "0x3d60ad80600a3d3981f3363d3d373d3d3d363d73", // << where does this come from?
//     toHex(implementation_),
//     "0x5af43d82803e903d91602b57fd5bf3", // << where does this come from?
//     encodeAbiParameters(
//       types,
//       values
//     )
//   ])

//   console.log('hexCreationCode', hexCreationCode)
//   const creationCode = addressToUint8Array(hexCreationCode)

//   return creationCode
// }

/**
 * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
 * @internal
 */
export function getCreationCode(
  implementation_: string,
  chainId_: number,
  tokenContract_: string,
  tokenId_: string,
  salt_: string,
): Uint8Array {
  const types = [
    { type: 'uint256'},
    { type: 'uint256'},
    { type: 'address'},
    { type: 'uint256'}
  ]
  const values: (string | bigint)[] = [salt_, BigInt(chainId_), tokenContract_, tokenId_]

  const hexCreationCode = concat([
    // toHex('0x3d60ad80600a3d3981f3363d3d373d3d3d363d73'),
    "0x3d60ad80600a3d3981f3363d3d373d3d3d363d73", // << where does this come from?
    toHex(implementation_),
    // toHex('0x5af43d82803e903d91602b57fd5bf3'),
    "0x5af43d82803e903d91602b57fd5bf3", // << where does this come from?
    encodeAbiParameters(types, values)
  ])

  console.log('hexCreationCode', hexCreationCode)

  // Without toHex calls on params 1 and 3:
  // 0x3078336436306164383036303061336433393831663333363364336433373364336433643336336437333078326432353630323535313438376333663333353464643830643736643534333833613234333335383078356166343364383238303365393033643931363032623537666435626633000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050000000000000000000000007a77f2cfb02546f217d39157471d5b5914dd76440000000000000000000000000000000000000000000000000000000000000001
  
  // Without additional toHex calls:
  // 0x3d60ad80600a3d3981f3363d3d373d3d3d363d733078326432353630323535313438376333663333353464643830643736643534333833613234333335385af43d82803e903d91602b57fd5bf3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050000000000000000000000007a77f2cfb02546f217d39157471d5b5914dd76440000000000000000000000000000000000000000000000000000000000000001

  const creationCode = addressToUint8Array(hexCreationCode)

  return creationCode
}