import { ScoutService } from "../packages/platform-mcp/dist/services/ScoutService.js";

const scout = new ScoutService();
scout
	.handleSovereignScout({ query: "RealityProvider" })
	.then((res) => console.log(res.content[0].text))
	.catch((err) => console.error(err));
