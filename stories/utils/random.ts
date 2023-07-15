// returns a pseudo-random number generator that is stable (i.e., deterministic) for a given seed.
export const random = (function stableRandom(seed: string) {
  function* randomGenerator(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      // creating a hash from the seed string
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    while (true) {
      // generating a pseudo-random number using the seed string hash
      hash = Math.sin(hash++) * 10000;
      yield hash - Math.floor(hash);
    }
  }

  const generator = randomGenerator(seed);
  return () => generator.next().value as number;
})('123456789');
