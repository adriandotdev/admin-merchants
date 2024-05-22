const MerchantRepository = require("../repository/MerchantRepository");

const generator = require("generate-password");
const { HttpBadRequest } = require("../utils/HttpError");
const Email = require("../utils/Email");

const axios = require("axios");

module.exports = class MerchantService {
	#repository;

	constructor() {
		this.#repository = new MerchantRepository();
	}

	async GetCPOs(data) {
		const result = await this.#repository.GetCPOs(data);

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

	async CheckRegisterCPO(type, value) {
		if (type === "username" && !String(value).match(/^[a-zA-Z0-9_]+$/))
			throw new HttpBadRequest(
				"INVALID_USERNAME",
				"Username must only contains letters, numbers, and underscores"
			);

		if (
			type === "contact_number" &&
			!String(value).match(/^(?:\+639|09)\d{9}$/)
		)
			throw new HttpBadRequest(
				"INVALID_CONTACT_NUMBER",
				"Contact number must be a valid number. (E.g. +639112231123 or 09112231123)"
			);

		if (
			type === "contact_email" &&
			!String(value).match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/)
		)
			throw new HttpBadRequest(
				"INVALID_CONTACT_EMAIL",
				"Contact email must be a valid email. (E.g. email@gmail.com)"
			);

		const result = await this.#repository.CheckRegisterCPO(type, value);

		const STATUS = result[0][0].STATUS;

		if (STATUS !== "SUCCESS") throw new HttpBadRequest(STATUS, []);

		return STATUS;
	}
	/**
	 * @param {String} cpoOwnerName
	 * @returns
	 */
	async SearchCPOByName(cpoOwnerName) {
		// Check if it is empty, then return all of the lists
		if (cpoOwnerName === ":cpo_owner_name") {
			const result = await this.#repository.GetCPOs({ limit: 10, offset: 0 });

			return result;
		}

		const result = await this.#repository.SearchCPOByName(
			cpoOwnerName.toLowerCase()
		);

		return result;
	}

	async UpdateCPOByID({ id, data }) {
		const VALID_INPUTS = [
			"cpo_owner_name",
			"contact_name",
			"contact_number",
			"contact_email",
			"username",
		];

		if (!Object.keys(data).every((value) => VALID_INPUTS.includes(value)))
			throw new HttpBadRequest(`Valid inputs are: ${VALID_INPUTS.join(", ")}`);

		if (Object.keys(data).length === 0) {
			// Check if data object is empty
			return "NO_CHANGES_APPLIED";
		}

		let newData = {};

		// Encrypt all of the updated data except the username.
		Object.keys(data).forEach((key) => {
			newData[key] = data[key];
		});

		// Setting up the query
		let query = "SET";

		const dataEntries = Object.entries(newData);

		for (const [key, value] of dataEntries) {
			query += ` ${key} = '${value}',`;
		}

		const updateResult = await this.#repository.UpdateCPOByID({
			id,
			query: query.slice(0, query.length - 1),
		});

		if (updateResult.affectedRows > 0) return "SUCCESS";

		throw new HttpBadRequest("CPO_ID_DOES_NOT_EXISTS", []);
	}

	async AddRFID(cpoOwnerID, rfidCardTag) {
		const result = await this.#repository.AddRFID(cpoOwnerID, rfidCardTag);

		const status = result[0][0].STATUS;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return status;
	}

	async Topup(cpoOwnerID, amount) {
		if (amount <= 0) throw new HttpBadRequest("INVALID_AMOUNT", []);

		const result = await this.#repository.Topup(cpoOwnerID, amount);

		const status = result[0][0].STATUS;
		const new_balance = result[0][0].current_balance;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return { status, new_balance };
	}

	async GetTopupByID(cpoOwnerID) {
		const result = await this.#repository.GetTopupByID(cpoOwnerID);

		return result;
	}

	async VoidTopup(referenceID) {
		const result = await this.#repository.VoidTopup(referenceID);

		const status = result[0][0].STATUS;
		const current_balance = result[0][0].current_balance;
		const reference_number = result[0][0].reference_number;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return { status, current_balance, reference_number };
	}

	async DeactivateCPOAccount(action, userID) {
		if (!["activate", "deactivate"].includes(action))
			throw new HttpBadRequest("INVALID_ACTION", {
				message: "Valid actions are: activate, and deactivate",
			});

		let result = null;

		if (action === "activate")
			result = await this.#repository.ActivateCPOAccount(userID);
		else result = await this.#repository.DeactivateCPOAccount(userID);

		if (result.affectedRows) return "SUCCESS";

		return "NO_CHANGES_APPLIED";
	}

	async GetCompanyPartnerDetails() {
		const result = await this.#repository.GetCompanyPartnerDetails();

		return result;
	}

	async RegisterCompanyPartnerDetails(companyName, address) {
		const geocodedAddress = await axios.get(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
				address
			)}&key=${process.env.GOOGLE_GEO_API_KEY}`
		);

		const address_components =
			geocodedAddress.data.results[0]?.address_components;

		if (!address_components) throw new HttpBadRequest("LOCATION_NOT_FOUND", []);

		const country_code = address_components.find((component) =>
			component.types.includes("country")
		)?.short_name;

		const party_id = await this.#GeneratePartyID(companyName);

		const result = await this.#repository.RegisterCompanyPartnerDetails({
			company_name: companyName,
			party_id,
			country_code,
		});

		if (result.insertId) return "SUCCESS";

		return result;
	}

	async #GeneratePartyID(companyName) {
		/**
		 * @Steps
		 *
		 * 1. Get all of the generated party ids first from the db.
		 *
		 * 2. Remove the spaces from company name.
		 *
		 * 3. Generate EVSE ID */

		const partyIDs = await this.#repository.GetCompanyPartnerDetails();

		const companyNameWithoutSpaces = String(companyName)
			.replace(/\s+/g, "")
			.trim()
			.toUpperCase(); // Trim and remove spaces.

		let partyID = companyNameWithoutSpaces.slice(0, 2);

		/** For the mean time, generation of this party_id is for the third (3rd) letter. */
		for (let i = 2; i < companyNameWithoutSpaces.length; i++) {
			// Check if party id already exists
			const isFound = partyIDs.some(
				(data) => data.party_id === partyID + companyNameWithoutSpaces[i]
			);

			if (!isFound) {
				partyID += companyNameWithoutSpaces[i];
				break;
			}
		}

		return partyID.toUpperCase(); // Return the party id. it must be uppercase.
	}
};
