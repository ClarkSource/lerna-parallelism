const { getChunkBounds, getLoadBalancedPackages } = require('./split');

describe('getChunkBounds', () => {
  for (let totalSize = 0; totalSize <= 20; totalSize++) {
    for (let chunkCount = 1; chunkCount <= 40; chunkCount++) {
      test(`getChunkBounds(totalSize = ${totalSize}, chunkCount = ${chunkCount}, chunkCount = ...)`, () => {
        let previousBoundary = 0;
        let count = 0;
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
          const [start, end] = getChunkBounds(
            totalSize,
            chunkCount,
            chunkIndex
          );
          expect(start).toBeGreaterThanOrEqual(previousBoundary);
          expect(start).toBeLessThanOrEqual(end);
          count += end - start;
          previousBoundary = end;
        }
        expect(previousBoundary).toBe(totalSize);
        expect(count).toBe(totalSize);
      });
    }
  }
});

class MockPackage {
  constructor(name, weight) {
    this.name = name;
    this.weight = weight;
  }

  get() {
    return this.weight;
  }
}

const mockLogger = { debug: () => {}, info: () => {} };

describe('getLoadBalancedPackages', () => {
  it('handles extreme case of one super heavy package', () => {
    const sourcePackages = [
      new MockPackage('a', 2),
      new MockPackage('b', 3),
      new MockPackage('c', 5),
      new MockPackage('d', 400),
      new MockPackage('e', 2)
    ];

    const { packages } = getLoadBalancedPackages(
      sourcePackages,
      2,
      0,
      'mocked',
      mockLogger
    );

    expect(packages.length).toBe(1);
    expect(packages[0].weight).toBe(400);

    const { packages: secondPartition } = getLoadBalancedPackages(
      sourcePackages,
      2,
      1,
      'mocked',
      mockLogger
    );

    expect(secondPartition.length).toBe(4);
  });

  it('handles a moderate case', () => {
    const sourcePackages = [
      new MockPackage('a', 10),
      new MockPackage('b', 5),
      new MockPackage('c', 5),
      new MockPackage('d', 5),
      new MockPackage('e', 2),
      new MockPackage('f', 2),
      new MockPackage('g', 2),
      new MockPackage('h', 1),
      new MockPackage('i', 1)
    ];

    // for 3 partitions, expecting this to end up as
    // 1: a(10) - h(1)
    // 2: b(5)  - d(5) - i(1)
    // 3: c(5)  - e(2) - f(2) - g(2)

    const { packages: firstPartition } = getLoadBalancedPackages(
      sourcePackages,
      3,
      0,
      'mocked',
      mockLogger
    );
    const { packages: secondPartition } = getLoadBalancedPackages(
      sourcePackages,
      3,
      1,
      'mocked',
      mockLogger
    );
    const { packages: thirdPartition } = getLoadBalancedPackages(
      sourcePackages,
      3,
      2,
      'mocked',
      mockLogger
    );

    // console.log({ firstPartition, secondPartition, thirdPartition });

    expect(firstPartition.length).toBe(2);
    expect(secondPartition.length).toBe(3);
    expect(thirdPartition.length).toBe(4);
  });
});
