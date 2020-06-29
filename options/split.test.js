const { getChunkBounds } = require('./split');

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
