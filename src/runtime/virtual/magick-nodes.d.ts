import type {
  makeAsyncNodeDefinition,
  makeEventNodeDefinition,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition,
} from "@magickml/behave-graph";

type FlowNodeDefinition = Parameters<typeof makeFlowNodeDefinition>[0];
type AsyncNodeDefinition = Parameters<typeof makeAsyncNodeDefinition>[0];
type EventNodeDefinition = Parameters<typeof makeEventNodeDefinition>[0];
type FunctionNodeDefinition = Parameters<typeof makeFunctionNodeDefinition>[0];

type NodeDefinition =
  | FlowNodeDefinition
  | AsyncNodeDefinition
  | EventNodeDefinition
  | FunctionNodeDefinition;

export declare const magickNodes: {
  name: string;
  handler: NodeDefinition;
}[];
