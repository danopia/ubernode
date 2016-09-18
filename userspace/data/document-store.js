// like dynamodb

var {SortBucket} = yield require('data/sort-bucket.js');
var {HashBucket} = yield require('data/hash-bucket.js');

exports.DocumentStore = class DocumentStore {
  constructor(opts) {
    this.tableName = opts.tableName;
    this.inflater = opts.inflater; // constructor function

    // schema
    this.hashKey = opts.hashKey;
    this.hashKeyType = opts.hashKeyType;
    this.sortKey = opts.sortKey;
    this.sortKeyType = opts.sortKeyType;

    this.hashBucket = new HashBucket(opts.hashKeyType);
  }

  _inflate(that) {
    if (this.inflater) {
      return new this.inflater(that);
    }
    return that;
  }

  putItem(doc) {
    if (!doc || doc.constructor !== Object) {
      throw new Error(`Document to put must be present and an Object`);
    }

    if (this.sortKey) {
      let sortBucket = this.hashBucket.getItem(doc[this.hashKey]);
      if (!sortBucket) {
        sortBucket = new SortBucket(this.sortKeyType);
        this.hashBucket.putItem(doc[this.hashKey], sortBucket);
      }

      return this._inflate(sortBucket.putItem(doc[this.sortKey], doc));
    } else {
      return this._inflate(this.hashBucket.putItem(doc[this.hashKey], doc));
    }
  }

  getItem(hashKey, sortKey) {
    if (this.sortKey) {
      let sortBucket = this.hashBucket.getItem(hashKey);
      if (sortBucket) {
        return this._inflate(sortBucket.getItem(sortKey));
      }
    } else {
      return this._inflate(this.hashBucket.getItem(hashKey));
    }
  }

  // Returns all documents, sorted if applicable
  scan() {
    if (this.sortKey) {
      var items = [];
      this.hashBucket.scan().forEach(sortBucket => {
        sortBucket.scan().forEach(item => {
          items.push(this._inflate(item));
        });
      });
      return items;

    } else {
      return this.hashBucket.scan().map(item => {
        return this._inflate(item);
      });
    }
  }

  // Returns all documents with the given hash key
  query(hashKey) {
    if (this.sortKey) {
      let sortBucket = this.hashBucket.getItem(hashKey);
      if (sortBucket) {
        return sortBucket.scan().map(item => {
          return this._inflate(item);
        });
      }
      return [];

    } else {
      // basically just getItem
      return this.hashBucket.getItem(hashKey);
    }
  }

  // Removes an item from the store
  deleteItem(hashKey, sortKey) {
    if (this.sortKey) {
      let sortBucket = this.hashBucket.getItem(hashKey);
      if (sortBucket) {
        // TODO: trim empty sortBuckets
        return sortBucket.deleteItem(sortKey);
      }
      return false;

    } else {
      return this.hashBucket.deleteItem(hashKey);
    }
  }
}
