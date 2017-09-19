const Bucket = require('./Bucket.js');

class RateLimiter {
    /**
     * Creates instance of a RateLimiter
     * @constructor
     * @param {int} maxTokens - The maximum number of tokens each bucket should hold
     * @param {int} refreshRate - How often, in seconds, to refill each bucket
     */
    constructor(maxTokens, refreshRate) {
        this.buckets = {};
        this.timeouts = {};
        this.maxTokens = maxTokens;
        this.refreshRate = refreshRate;
    }

    /**
     * Creates a new Bucket that is ratelimited independently. Deleted after a period of inactivity
     * @param {string} id - A unique identifier for the new Bucket
     * @param {int=} maxTokens - The maximum number of tokens each bucket should hold
     * @param {int=} refreshRate - How often, in seconds, to refill each bucket 
     */
    create(id, maxTokens, refreshRate) {
        // If a bucket exists for this id, return
        // May instead refresh the bucket
        if(this.buckets[id] && this.buckets[id] instanceof Bucket) {
            return;
        }

        if(!maxTokens) {
            maxTokens = this.maxTokens;
        }
        if(!refreshRate) {
            refreshRate = this.refreshRate;
        }

        this.buckets[id] = new Bucket(maxTokens, refreshRate);
        this.timeouts[id] = setTimeout(() => {
            delete this.buckets[id];
        }, refreshRate * 5000)
    }

    /**
     * Consumes a set number of tokens from the specified bucket
     * @param {string} id - The unique identifier for the bucket to consume a token from
     * @param {int=1} tokens - The number of tokens to consume
     */
    consume(id, tokens=1) {
        let b = this.buckets[id];

        // No bucket found
        if(!(b instanceof Bucket)) {
            this.create(id);
            b = this.buckets[id];
        }

        clearTimeout(this.timeouts[id]);
        this.timeouts[id] = setTimeout(() => {
            console.log("Removing unused bucket...");
            delete this.buckets[id];
        }, b.refreshRate * 5000)

        if(!b.consume(tokens)) {
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Retrieves details of a specified bucket
     * @param {string} id - The unique identifier for the bucket to retrieve details for
     */
    getDetails(id) {
        let b = this.buckets[id];
        if(!b) {
            return false;
        }

        let details = {
            tokens: b.tokens,
            maxTokens: b.maxTokens,
            reset: b.lastUpdated + b.refreshRate*1000
        }

        return details;
    }
}

module.exports = RateLimiter;