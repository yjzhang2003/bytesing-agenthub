import { createRoot } from "react-dom/client";
import { AgentHubWorkbench } from "@agenthub/ui";

const root = document.querySelector("#root");

if (root) {
  createRoot(root).render(<AgentHubWorkbench />);
}
