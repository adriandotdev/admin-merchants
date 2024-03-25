const MerchantRepository = require("../repository/MerchantRepository");

module.exports = class MerchantService {
	#repository;

	constructor() {
		this.#repository = new MerchantRepository();
	}

	async GetMerchants() {
		const result = await this.#repository.GetMerchants();

		return result;
	}
};
