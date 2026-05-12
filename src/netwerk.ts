import Graph from "graphology";
import Sigma from "sigma";
import { EdgeDisplayData, NodeDisplayData } from "sigma/types";

async function initializeGraph() {
  // Fetch the dataset
  const response = await fetch("./probeersel2.json");
  const dataset: any = await response.json();

  //get container
  const container = document.getElementById("sigma-container") as HTMLElement;

  // Build a graphology graph from the dataset
  const graph = new Graph();

  // Add nodes
  for (const node of dataset.nodes) {
    const attrs = node.attributes || {};
    graph.addNode(node.key, {
      label: node.key,
      x: attrs.x || 0,
      y: attrs.y || 0,
      color: attrs.color || "#999999",
      size: attrs.size || 10,
    });
  }

  // Add edges
  for (const edge of dataset.edges) {
    const source = edge.source || edge.from;
    const target = edge.target || edge.to;
    if (graph.hasNode(source) && graph.hasNode(target) && !graph.hasEdge(source, target)) {
      graph.addEdge(source, target);
    }
  }

  // Render
  const renderer = new Sigma(graph, container)

  

interface State {
  selectedNode?: string;
  selectedNeighbors?: Set<string>;
}


const state: State = {};

// ------------------------------------
// State updates
// ------------------------------------

function setSelectedNode(node?: string) {
  if (node) {
    state.selectedNode = node;
    state.selectedNeighbors = new Set(graph.neighbors(node));
  } else {
    state.selectedNode = undefined;
    state.selectedNeighbors = undefined;
  }


  // We only change rendering logic, not graph structure
  renderer.refresh({
    skipIndexation: true,
  });
}

// ------------------------------------
// Graph interactions
// ------------------------------------



renderer.on("clickNode", ({ node }) => {
  // Optional: toggle behavior
  if (state.selectedNode === node) {
    setSelectedNode(undefined);
  } else {
    setSelectedNode(node);
  }
});

renderer.on("clickStage", () => {
  setSelectedNode(undefined);
});


// ------------------------------------
// Node reducer
// ------------------------------------
//
// Rules:
// 1. Hovered node stays visible and highlighted
// 2. Its neighbors stay visible
// 3. All other nodes are greyed out and labels hidden
//
renderer.setSetting("nodeReducer", (node, data) => {
  const res: Partial<NodeDisplayData> = { ...data };

  if (
    state.selectedNode &&
    node !== state.selectedNode &&
    !state.selectedNeighbors?.has(node)
  ) {
    res.label = "";
    res.color = "#f0f0f0";
  }

  if (node === state.selectedNode) {
    res.highlighted = true;
    res.forceLabel = true;
  }

  return res;
});

// ------------------------------------
// Edge reducer
// ------------------------------------
//
// Rule:
// Only show edges connected to the hovered node
//
renderer.setSetting("edgeReducer", (edge, data) => {
  const res: Partial<EdgeDisplayData> = { ...data };

  if (state.selectedNode) {
    const [source, target] = graph.extremities(edge);

    if (source !== state.selectedNode && target !== state.selectedNode) {
      res.hidden = true;
    }
  }

  return res;
});

}

initializeGraph()