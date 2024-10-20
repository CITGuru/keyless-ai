import { createPublicClient, http, checksumAddress, isAddress, createWalletClient, parseEther, getContract, parseUnits, encodeFunctionData } from 'viem'
import { mainnet } from 'viem/chains'
import { ERC20_ABI } from './abi'

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { token_list } from './tokens'

// Create the viem client (mainnet, for example)
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})



export const createAccountWalletClient = (address: string, chain: string) => {
  const client = createWalletClient({
    account: `0x${address}`,
    chain: mainnet,
    transport: http(),
  })
  return client
}

// Fetch Native Balance
export async function getNativeBalance(address: string) {
  try {
    const balance = await client.getBalance({ address: `0x${address}` })
    console.log('Native balance:', balance)
    return balance
  } catch (error) {
    console.error('Error fetching native balance:', error)
  }
}

// Fetch ERC-20 Token Balance
export async function getERC20Balance(address: string, contractAddress: string) {
  try {
    const erc20Balance = await client.readContract({
      address: `0x${contractAddress}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    })
    console.log('ERC-20 Token Balance:', erc20Balance)
    return erc20Balance
  } catch (error) {
    console.error('Error fetching ERC-20 token balance:', error)
  }
}


// export async function getErc20Info() {

// }



export function buildTransferNative(from: string, receiver: string, amount: number) {
  return {
    to: receiver,
    value: parseEther(amount.toString()), // Convert amount to wei
    from: from
  };
}


export function getTokenContract(contractAddress: string) {
  const contract = getContract({
    address: `0x${contractAddress}`,
    abi: ERC20_ABI,
    client: client,
  })

  return contract
}

export async function buildTransferERC20(contractAddress: string, receiver: string, amount: number, from: string) {
  const contract = getTokenDetailsByContract(contractAddress)
  const decimalNumber = contract?.decimals || 18

  // Parse the token amount to the correct unit (e.g., assuming 18 decimals)
  const tokenAmount = parseUnits(`${amount}`, decimalNumber)

  // Encode the function data for the ERC-20 transfer
  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [receiver, tokenAmount],
  })

  return {
    to: contractAddress,
    data: data,
    from: from,
    value: 0
  };
}



export class ETHAddress {
  hex?: `0x${string}`
  ensDomain?: string | null
  originalStr: string

  constructor(hexOrEns: string) {
    this.originalStr = hexOrEns
  }

  async resolve() {
    const address = this.originalStr
    if (address.endsWith('.eth')) {
      this.hex = await this.resolveENS(address)
      this.ensDomain = address
    } else if (isAddress(address)) {
      this.hex = checksumAddress(address) as `0x${string}`
      this.ensDomain = null
    } else {
      throw new Error(`Invalid address: ${address}`)
    }
  }

  async resolveENS(ens: string): Promise<`0x${string}`> {
    try {
      const address = await client.getEnsAddress({ name: ens })
      if (!address) {
        throw new Error(`Invalid ENS: ${ens}`)
      }
      return address as `0x${string}`
    } catch (error) {
      throw new Error(`Error resolving ENS: ${error}`)
    }
  }

  toString(): string {
    return this.ensDomain ? `${this.ensDomain} (${this.hex || ''})` : this.hex || ''
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const getTokenDetails =(symbol: string, chainId: number)=>{
   const token = token_list.find((t)=> t.symbol == symbol && chainId == t.chainId)
   console.log(symbol, chainId)
   return token
}

export const getTokenDetailsByContract =(contractAddress: string)=>{
  const token = token_list.find((t)=> t.address.toLowerCase()==contractAddress.toLowerCase())
  return token
}