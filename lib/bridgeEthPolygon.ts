import { createPublicClient, http, encodeFunctionData } from 'viem';
import { UNIFIED_BRIDGE } from './abi';

export const unifiedBridgeContractAddress =
    '0x528e26b25a34a4a5d0dbda1d57d318153d2ed582';

export const constructBridgeTransaction = async (
    destinationAddress: string,
    tokenAddress: string,
    tokenAmount: bigint,
) => {
    const destinationNetworkId = 1;
    const forceUpdateGlobalExitRoot = true;
    const permitData = '0x';

    const data = encodeFunctionData({
        abi: UNIFIED_BRIDGE,
        functionName: 'bridgeAsset',
        args: [
            destinationNetworkId,
            destinationAddress,
            tokenAmount,
            tokenAddress,
            forceUpdateGlobalExitRoot,
            permitData,
        ],
    });

    return {
        to: unifiedBridgeContractAddress,
        data,
        value: 0
    }
}