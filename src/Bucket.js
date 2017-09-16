class Bucket {
	/**
	 * Creates instance of a Bucket
	 * @constructor
	 * @param {int} maxTokens - The maximum number of tokens the bucket should hold
	 * @param {int} refreshRate - How often, in seconds, to refill the bucket
	 */
	constructor(maxTokens, refreshRate) {
		this.maxTokens = maxTokens;
		this.tokens = maxTokens;
		this.lastUpdated = new Date().getTime();
		this.refreshRate = refreshRate;
		this.interval = setInterval(() => {
			this.tokens = this.maxTokens;
			this.lastUpdated = new Date().getTime();
		}, refreshRate * 1000)

		return this;
	}

	/**
	 * Attempts to consume the specified number of tokens
	 * @param {int=1} tokens - How many tokens to consume
	 * @returns {boolean} Whether a token was successfully consumed
	 */
	consume(tokens=1) {
		if(this.tokens >= tokens) {
			this.tokens -= tokens;
			return true;
		}
		else {
			return false;
		}
	}
}

module.exports = Bucket;