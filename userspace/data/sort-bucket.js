exports.SortBucket = class SortBucket {
  constructor(keyType) {
    this.keyType = keyType; // String, Number

    this.keySet = new Array();
    this.values = new Map();
  }

  // get by exact match
  getItem(key) {
    if (!key) {
      throw new Error(`Sort key is required for getItem()`);
    } else if (key.constructor !== this.keyType) {
      throw new Error(`Given Sort key is a ${key.constructor} but supposed to be ${this.keyType}`);
    }

    if (this.keySet.includes(key)) {
      return this.values.get(key);
    }
  }

  // find next item after key
  queryItemAfter(key) {
    if (!key) {
      throw new Error(`Sort key is required for getItem()`);
      // return this.values.get(this.keySet[0]);
    } else if (key.constructor !== this.keyType) {
      throw new Error(`Given Sort key is a ${key.constructor} but supposed to be ${this.keyType}`);
    }

    var idx = this.keySet.findIndex((that) => that > key);
    if (idx >= 0) {
      return this.values.get(this.keySet[idx]);
    }
  }

  // return all items in order
  scan() {
    return this.keySet.map((key) => {
      return this.values.get(key);
    });
  }

  // create or replace one item
  putItem(key, item) {
    if (!key) {
      throw new Error(`Sort key must be present and truthy`);
    } else if (key.constructor !== this.keyType) {
      throw new Error(`Given Sort key is a ${key.constructor} but supposed to be ${this.keyType}`);
    }

    // make sure key is in keyset
    if (!this.keySet.includes(key)) {
      var idx = this.keySet.findIndex((hay) => hay > key);

      // insert key
      if (idx < 0) {
        this.keySet.push(key);
      } else {
        this.keySet.splice(idx, 0, key);
      }
    }

    // set the value
    this.values.set(key, item);
    return item;
  }

  // remove one item
  deleteItem(key) {
    var idx = this.keySet.indexOf(key);
    if (idx < 0) {
      return;
    }

    this.keySet.splice(idx, 1);
    return this.values.delete(key);
  }
}
