exports.HashBucket = class HashBucket {
  constructor(keyType) {
    this.keyType = keyType; // String, Number

    this.map = new Map();
  }

  // get by exact match
  getItem(key) {
    if (!key) {
      throw new Error(`Hash key is required for getItem()`);
    } else if (key.constructor !== this.keyType) {
      throw new Error(`Given Hash key is a ${key.constructor} but supposed to be ${this.keyType}`);
    }

    return this.map.get(key);
  }

  // return all items
  scan() {
    let items = [];
    for (let item of this.map.values()) {
      items.push(item);
    });
    return items;
  }

  // create or replace one item
  putItem(key, item) {
    if (!key) {
      throw new Error(`Hash key must be present and truthy`);
    } else if (key.constructor !== this.keyType) {
      throw new Error(`Given Hash key is a ${key.constructor} but supposed to be ${this.keyType}`);
    }

    // set the item
    this.map.set(key, item);
    return item;
  }

  // remove one item
  deleteItem(key) {
    return this.values.delete(key);
  }
}
