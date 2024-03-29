/*
 * @Author: 焦质晔
 * @Date: 2021-03-08 11:04:35
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-02 09:36:01
 */
type IStoreItem = {
  x: string;
  y: string;
  text: string;
};

type IStoreState = {
  required: IStoreItem[];
  validate: IStoreItem[];
  inserted: IStoreItem[];
  updated: IStoreItem[];
  removed: IStoreItem[];
};

class Store {
  public state: IStoreState = {
    required: [],
    validate: [],
    inserted: [],
    updated: [],
    removed: [],
  };

  addToRequired = (data) => {
    const index = this.state.required.findIndex((item) => item.x === data.x && item.y === data.y);
    if (index !== -1) return;
    this.state.required.push(data);
  };

  removeFromRequired = (data) => {
    const index = this.state.required.findIndex((item) => item.x === data.x && item.y === data.y);
    if (index < 0) return;
    this.state.required.splice(index, 1);
  };

  addToValidate = (data) => {
    const index = this.state.validate.findIndex((item) => item.x === data.x && item.y === data.y);
    if (index !== -1) return;
    this.state.validate.push(data);
  };

  removeFromValidate = (data) => {
    const index = this.state.validate.findIndex((item) => item.x === data.x && item.y === data.y);
    if (index < 0) return;
    this.state.validate.splice(index, 1);
  };

  addToInserted = (data) => {
    const index = this.state.inserted.findIndex((row) => row === data);
    if (index !== -1) return;
    this.state.inserted.push(data);
  };

  removeFromInserted = (data) => {
    const index = this.state.inserted.findIndex((row) => row === data);
    if (index < 0) return;
    this.state.inserted.splice(index, 1);
  };

  addToUpdated = (data) => {
    const index = this.state.updated.findIndex((row) => row === data);
    if (index !== -1) return;
    this.state.updated.push(data);
  };

  removeFromUpdated = (data) => {
    const index = this.state.updated.findIndex((row) => row === data);
    if (index < 0) return;
    this.state.updated.splice(index, 1);
  };

  addToRemoved = (data) => {
    const index = this.state.removed.findIndex((row) => row === data);
    if (index !== -1) return;
    this.state.removed.push(data);
  };

  removeFromRemoved = (data) => {
    const index = this.state.removed.findIndex((row) => row === data);
    if (index < 0) return;
    this.state.removed.splice(index, 1);
  };

  clearAllLog = () => {
    this.state.required = [];
    this.state.validate = [];
    this.state.inserted = [];
    this.state.updated = [];
    this.state.removed = [];
  };

  destroy = () => {
    // 释放内存
    for (const key in this) {
      (this as any)[key] = null;
    }
  };
}

export default Store;
export type { Store };
