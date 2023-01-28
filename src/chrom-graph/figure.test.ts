import * as F from './figure'
import * as C from './collide'

test('figure1', () => {
    const fig0 = F.figure1('')
    const collide = C.collide(fig0)
    expect(collide.fig.nodes).toHaveLength(7)
})
test('figure2', () => {
    const fig0 = F.figure2('')
    const collide = C.collide(fig0)
    expect(collide.fig.nodes).toHaveLength(31)
})
test('figure4', () => {
    const fig0 = F.figure4('')
    const collide = C.collide(fig0)
    expect(collide.fig.nodes).toHaveLength(61)
})
test('figure5', () => {
    const fig0 = F.figure5('')
    const collide = C.collide(fig0)
    expect(collide.fig.nodes).toHaveLength(121)
})
test('figure7a', () => {
    const fig0 = F.figure7a('')
    const collide = C.collide(fig0)
    expect(collide.fig.nodes).toHaveLength(7)
    expect(collide.fig.edges).toHaveLength(11)
})
test('figureW', () => {
    const fig0 = F.figureW('')
    const collide = C.collide(fig0)
    expect(collide.fig.nodes).toHaveLength(301)
})
test('figure8', () => {
    const fig0 = F.figure8('')
    const collide = C.collide(fig0)
    expect(collide.fig.nodes).toHaveLength(1345)
})

