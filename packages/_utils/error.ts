/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:27:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-09 12:34:22
 */
class QmDesignError extends Error {
  constructor(m: string) {
    super(m);
    this.name = 'QmDesignError';
  }
}

export function throwError(scope: string, m: string): void {
  throw new QmDesignError(`[${scope}] ${m}`);
}

export function warn(scope: string, m: string): void {
  console.warn(new QmDesignError(`[${scope}] ${m}`));
}
