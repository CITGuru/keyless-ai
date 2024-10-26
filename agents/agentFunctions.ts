import { Swarm, Agent, AgentFunction } from "@pluralityai/agents";
import { SwapTokenAgent , BridgeTokenAgent, SendTokenAgent} from "./index"

export const transferToSwapAgent: AgentFunction = {
    name: "transferToSwapAgent",
    func: () => {
      console.log("Transferring to Swap Agent");
      return SwapTokenAgent;
    },
    descriptor: {
      name: "transferToSwapAgent",
      description: "Transfer swap interactions to Swap Token Agent",
      parameters: {},
    },
  };


  export const transferToBridgeAgent: AgentFunction = {
    name: "transferToBridgeAgent",
    func: () => {
      console.log("Transferring to Bridge Agent");
      return BridgeTokenAgent;
    },
    descriptor: {
      name: "transferToBridgeAgent",
      description: "Transfer bridge interactions to Bridge Token Agent",
      parameters: {},
    },
  };


  export const transferToSendAgent: AgentFunction = {
    name: "transferToSendAgent",
    func: () => {
      console.log("Transferring to Send Token Agent");
      return SendTokenAgent;
    },
    descriptor: {
      name: "transferToSendAgent",
      description: "Transfer send interactions to Send Token Agent",
      parameters: {},
    },
  };