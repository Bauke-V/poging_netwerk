import Graph from "graphology";
import Sigma from "sigma";

// Fetch the dataset
const response = await fetch("probeersel2.json");
const dataset: any = await response.json();

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
new Sigma(graph, document.getElementById("sigma-container") as HTMLElement);