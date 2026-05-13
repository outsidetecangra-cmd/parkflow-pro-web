"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_config_1 = require("./config/agent.config");
const agent_runtime_1 = require("./runtime/agent-runtime");
async function main() {
    const config = (0, agent_config_1.loadAgentConfig)();
    const runtime = new agent_runtime_1.AgentRuntime(config);
    await runtime.start();
}
main().catch((error) => {
    console.error("[agent] startup failure", error);
    process.exit(1);
});
