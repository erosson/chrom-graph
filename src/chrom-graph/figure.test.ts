import * as G from './graph.js'

test('figure1', () => {
    const g = G.buildGraph(G.byName['figure1'])
    expect(g.collide.fig.nodes).toHaveLength(7)
})
test('figure2', () => {
    const g = G.buildGraph(G.byName['figure2'])
    expect(g.collide.fig.nodes).toHaveLength(31)
})
test('figure4', () => {
    const g = G.buildGraph(G.byName['figure4'])
    expect(g.collide.fig.nodes).toHaveLength(61)
})
test('figure5', () => {
    const g = G.buildGraph(G.byName['figure5'])
    expect(g.collide.fig.nodes).toHaveLength(121)
})
test('figure7a', () => {
    const g = G.buildGraph(G.byName['figure7a'])
    expect(g.collide.fig.nodes).toHaveLength(7)
    expect(g.collide.fig.edges).toHaveLength(11)
})
test('figureW', () => {
    const g = G.buildGraph(G.byName['figureW'])
    expect(g.collide.fig.nodes).toHaveLength(301)
})
test('figure8', () => {
    const g = G.buildGraph(G.byName['figure8'])
    expect(g.collide.fig.nodes).toHaveLength(1345)
})

