import { writeFileSync, copyFileSync } from "fs";
import { WEB_CONFIG } from "./web.config.js";
import { SERVER_CJS } from "./port.js";

/** @type {import('.').default} */
export default function (options) {
  /** @type {import('@sveltejs/kit').Adapter} */
  const adapter = {
    name: "sveltekit-adapter-iis",
    async adapt(builder) {
      const outputDir = `${builder.config.kit.outDir}/output`;

      writeFileSync(`${outputDir}/web.config`, WEB_CONFIG);
      writeFileSync(`${outputDir}/server/server.cjs`, SERVER_CJS);
      copyFileSync(
        `${builder.config.kit.env.dir}/package.json`,
        `${outputDir}/package.json`
      );
    },
  };

  return adapter;
}
