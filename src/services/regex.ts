export const matchAll = (content: string, regex: RegExp) => {
  let m: RegExpExecArray | null;
  const result = [] as string[];
  do {
    m = regex.exec(content);
    if (m) {
      result.push(m[5] + m[6]);
    }
  } while (m);
  return result;
};
