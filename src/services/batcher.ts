export const mapBatcher = async <T, Z>(
  list: T[],
  callback: (item: T, index: number) => Z,
  batchSize = 10000
) => {
  const result: Z[] = [];
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = [...list].slice(i, i + batchSize);
    const items = await Promise.all(
      batch.map(async (item, index) => await callback(item, index))
    );
    items.map((item) => result.push(item));
  }
  return result;
};

export const filterBatcher = async <T>(
  list: T[],
  callback: (item: T, index: number) => T | undefined,
  batchSize = 10000
) => {
  const result: T[] = [];
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = [...list].slice(i, i + batchSize);
    const items = await Promise.all(
      batch.map(async (item, index) => await callback(item, index))
    );
    items.map((item) => (item ? result.push(item) : 0));
  }
  return result;
};
