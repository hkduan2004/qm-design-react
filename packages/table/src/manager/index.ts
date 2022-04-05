/*
 * @Author: 焦质晔
 * @Date: 2022-01-12 15:43:49
 * @Last Modified by:   焦质晔
 * @Last Modified time: 2022-01-12 15:43:49
 */
import type { TableRef } from '../table/types';
import type { Nullable } from '../../../_utils/types';

type Instance = {
  id: string;
  vm: React.ForwardedRef<TableRef>;
};

let instances: Instance[] = [];

const TableManager = {
  getFocusInstance: function (): Nullable<Instance> {
    return instances[0] ?? null;
  },
  getInstance: function (id: string): Nullable<Instance> {
    return instances.find((x) => x.id === id) ?? null;
  },
  focus: function (id: string): void {
    const target: Instance = this.getInstance(id);
    if (!target || instances.findIndex((x) => x === target) === 0) return;
    this.deregister(id);
    instances = [target, ...instances];
  },
  register: function (id: string, instance: React.ForwardedRef<TableRef>): void {
    if (id && instance) {
      if (this.getInstance(id) !== null) {
        this.deregister(id);
      }
      instances = [{ id, vm: instance }, ...instances];
    }
  },
  deregister: function (id: string): void {
    if (id) {
      instances = instances.filter((x) => x.id !== id);
    }
  },
};

export default TableManager;
