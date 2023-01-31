import * as F from "./chrom-graph/figure.js";
import * as G from "./chrom-graph/graph.js";
import gexf from "graphology-gexf";
import * as fs from "fs/promises";

async function main() {
  const dir = "public/graphdata";
  await fs.mkdir(dir, { recursive: true });
  for (let instance of F.list) {
    console.log(`${instance.name}...`);
    const g = G.buildGraph(instance);
    await Promise.all([
      await fs.writeFile(`${dir}/${instance.name}.gexf`, gexf.write(g.graph)),
      // await fs.writeFile(`${dir}/${instance.name}.json`, JSON.stringify(g))
      await fs.writeFile(`${dir}/${instance.name}.cnf`, g.cnfInput)
    ]);
    console.log(`${instance.name} finished`);
  }
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
