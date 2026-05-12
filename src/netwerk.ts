import Graph from "graphology";
import Sigma from "sigma";

// ---------- PANEL LOGIC ----------

function showNodeInfo(node: string, graph: Graph) {
  const attrs: any = graph.getNodeAttributes(node);

  const panel = document.getElementById("info-panel")!;
  panel.classList.remove("hidden");

  // Image
  const img = document.getElementById("node-image") as HTMLImageElement;
  if (attrs.image) {
    img.src = attrs.image;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  // Title & bio
  document.getElementById("node-title")!.textContent =
    attrs.label || node;

  document.getElementById("node-bio")!.textContent =
    attrs.bio || "";

  // Links
  const linksList = document.getElementById("node-links")!;
  linksList.innerHTML = "";

  if (Array.isArray(attrs.links)) {
    for (const link of attrs.links) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = link.url;
      a.textContent = link.label;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      li.appendChild(a);
      linksList.appendChild(li);
    }
  }
}

// ---------- MAIN ----------

async function initializeGraph() {
  // Load dataset (must be in /public)
  const response = await fetch("./probeersel2.json");
  const dataset: any = await response.json();

  const graph = new Graph();

  // Add nodes
  for (const node of dataset.nodes) {
    const attrs = node.attributes || {};

    graph.addNode(node.key, {
      label: attrs.label || node.key,
      x: attrs.x ?? Math.random(),
      y: attrs.y ?? Math.random(),
      size: attrs.size ?? 10,
      color: attrs.color ?? "#999",

      // metadata
      image: attrs.image,
      bio: attrs.bio,
      links: attrs.links,
    });
  }

  // Add edges
  for (const edge of dataset.edges) {
    const source = edge.source || edge.from;
    const target = edge.target || edge.to;

    if (
      graph.hasNode(source) &&
      graph.hasNode(target) &&
      !graph.hasEdge(source, target)
    ) {
      graph.addEdge(source, target);
    }
  }

  // Render Sigma
  const container = document.getElementById("sigma-container")!;
  const renderer = new Sigma(graph, container);

  // ---------- EVENTS ----------

  // Click on node → open panel + focus
  renderer.on("clickNode", ({ node }) => {
    showNodeInfo(node, graph);

    const x = graph.getNodeAttribute(node, "x");
    const y = graph.getNodeAttribute(node, "y");

    renderer.getCamera().animate(
      { x, y, ratio: 0.6 },
      { duration: 500 }
    );
  });

  // Click on background → close panel
  renderer.on("clickStage", () => {
    document.getElementById("info-panel")!.classList.add("hidden");
  });

  // Close button
  document.getElementById("close-panel")!.onclick = () => {
    document.getElementById("info-panel")!.classList.add("hidden");
  };
}

initializeGraph();