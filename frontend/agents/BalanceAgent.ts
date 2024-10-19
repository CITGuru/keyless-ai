// import { ETHAddress, getERC20Balance, getNativeBalance } from "@/lib/utils";
// import { Swarm, Agent, AgentFunction } from "@pluralityai/agents";
// const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"


// export const getTokenBalance: AgentFunction = {
//     name: "getTokenBalance",
//     func: async ({ address, token }) => {
//       let from = new ETHAddress(address)
//       await from.resolve()

//       let balance = 0
      

//       if(from.hex == NATIVE_TOKEN_ADDRESS){
//         balance = await getNativeBalance(address)
//       }else {
//         let contractAddress = 
//         balance = await getERC20Balance(address)
//       }

//     },
//     descriptor: {
//       name: "getTokenBalance",
//       description: "Triggers native and erc20 transfer",
//       parameters: {
//         address: {
//           type: "string",
//           required: true,
//           description: "The value to send to the receiver address",
//         },
//         contractAddress: {
//           type: "string",
//           required: false,
//           description: "The native token or ERC20 token to send",
//         },
//       },
//     },
//   };