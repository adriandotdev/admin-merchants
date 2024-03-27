const MerchantRepository = require("../repository/MerchantRepository");

const generator = require("generate-password");
const { HttpBadRequest } = require("../utils/HttpError");
const Email = require("../utils/Email");

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

    // await email.SendUsernameAndPassword();

    const result = await this.#repository.RegisterCPO({ ...data, password });

    const status = result[0][0].STATUS;

    if (status !== "SUCCESS") throw new HttpBadRequest("Bad Request", status);

    return status;
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

    return updateResult;
  }

  async AddRFID(cpoOwnerID, rfidCardTag) {
    const result = await this.#repository.AddRFID(cpoOwnerID, rfidCardTag);

    const status = result[0][0].STATUS;

    return status;
  }

  async Topup(cpoOwnerID, amount) {
    const result = await this.#repository.Topup(cpoOwnerID, amount);

    const status = result[0][0].STATUS;

    return status;
  }

  async GetTopupByID(cpoOwnerID) {
    const result = await this.#repository.GetTopupByID(cpoOwnerID);

    return result;
  }
};
