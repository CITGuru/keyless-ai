import { createPublicClient, http, checksumAddress, isAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { ERC20_ABI } from './abi'

// Create the viem client (mainnet, for example)
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

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
