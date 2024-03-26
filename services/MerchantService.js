const MerchantRepository = require("../repository/MerchantRepository");

const generator = require("generate-password");
const { HttpBadRequest } = require("../utils/HttpError");
const Email = require("../utils/Email");

module.exports = class MerchantService {
	#repository;

	constructor() {
		this.#repository = new MerchantRepository();
	}

	async GetCPOs() {
		const result = await this.#repository.GetCPOs();

		return result;
	}

	async RegisterCPO(data) {
		const password = generator.generate({ length: 10, numbers: false });
		const username = data.username;

		const email = new Email(data.contact_email, { username, password });

		await email.SendUsernameAndPassword();

		const result = await this.#repository.RegisterCPO({ ...data, password });

		const status = result[0][0].STATUS;

		if (status !== "SUCCESS") throw new HttpBadRequest("Bad Request", status);

		return status;
	}
};
