import * as F from './chrom-graph/figure'
import * as G from './chrom-graph/graph'
import gexf from "graphology-gexf";
import * as fs from 'fs/promises'

async function main() {
    for (let instance of F.list) {
        console.log(`${instance.name}...`)
        const g = G.buildGraph(instance)
        const body = gexf.write(g.graph)
        await fs.writeFile(`out/${instance.name}.gexf`, body)
        console.log(`${instance.name} finished`)
    }
}
main().catch((err) => {
    console.error(err)
    process.exit(1)
})
