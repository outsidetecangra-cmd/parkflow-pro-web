import { loadAgentConfig } from "./config/agent.config";
import { AgentRuntime } from "./runtime/agent-runtime";

async function main() {
  const config = loadAgentConfig();
  const runtime = new AgentRuntime(config);

  await runtime.start();
}

main().catch((error) => {
  console.error("[agent] startup failure", error);
  process.exit(1);
});
