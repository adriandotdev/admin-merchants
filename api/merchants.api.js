const { AccessTokenVerifier } = require("../middlewares/TokenMiddleware");
const MerchantService = require("../services/MerchantService");
const {
  HttpUnauthorized,
  HttpUnprocessableEntity,
} = require("../utils/HttpError");

const logger = require("../config/winston");
const { validationResult, body } = require("express-validator");
/**
 * @param {import ('express').Express} app
 */
module.exports = (app) => {
  const service = new MerchantService();

  /**
   * This function will be used by the express-validator for input validation,
   * and to be attached to APIs middleware.
   * @param {*} req
   * @param {*} res
   */
  function validate(req, res) {
    const ERRORS = validationResult(req);

    if (!ERRORS.isEmpty()) {
      throw new HttpUnprocessableEntity(
        "Unprocessable Entity",
        ERRORS.mapped()
      );
    }
  }

  app.get(
    "/admin_merchants/api/v1/merchants",
    [AccessTokenVerifier],

    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns
     */
    async (req, res) => {
      try {
        if (req.role !== "ADMIN")
          throw new HttpUnauthorized("Unauthorized", []);

        const { limit, offset } = req.query;

        const result = await service.GetCPOs({
          limit: limit || 10,
          offset: offset || 0,
        });

        // There is a bug here
        res.setHeader(
          "X-Pagination",
          `${req.url}?limit=${parseInt(limit) || 10}&offset=${
            parseInt(offset) + 10
          }`
        );
        return res
          .status(200)
          .json({ status: 200, data: result, message: "Success" });
      } catch (err) {
        return res.status(err.status || 500).json({
          status: err.status || 500,
          data: err.data || [],
          message: err.message || "Internal Server Error",
        });
      }
    }
  );

  app.post(
    "/admin_merchants/api/v1/merchants",
    [
      AccessTokenVerifier,
      body("party_id")
        .notEmpty()
        .withMessage("Missing required property: party_id")
        .isLength({ min: 3, max: 3 })
        .withMessage("Party ID must be length of three (3)")
        .escape()
        .trim(),
      body("cpo_owner_name")
        .notEmpty()
        .withMessage("Missing required property: cpo_owner_name")
        .escape()
        .trim(),
      body("contact_name")
        .notEmpty()
        .withMessage("Missing required property: contact_person")
        .escape()
        .trim(),
      body("contact_number")
        .notEmpty()
        .withMessage("Missing required property: contact_number")
        .escape()
        .trim(),
      body("contact_email")
        .notEmpty()
        .withMessage("Missing required property: contact_email")
        .isEmail()
        .withMessage("Please provide a valid contact_email")
        .escape()
        .trim(),
      body("username")
        .notEmpty()
        .withMessage("Missing required property: username")
        .escape()
        .trim(),
    ],

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async (req, res) => {
      try {
        if (req.role !== "ADMIN")
          throw new HttpUnauthorized("Unauthorized", []);

        validate(req, res);

        const {
          party_id,
          cpo_owner_name,
          contact_name,
          contact_number,
          contact_email,
          username,
        } = req.body;

        logger.info({
          REGISTER_CPO_REQUEST: {
            ...req.body,
          },
        });

        const result = await service.RegisterCPO({
          party_id,
          cpo_owner_name,
          contact_name,
          contact_number,
          contact_email,
          username,
        });

        logger.info({
          REGISTER_CPO_RESPONSE: {
            message: "SUCCESS",
          },
        });
        return res
          .status(200)
          .json({ status: 200, data: result, message: "Success" });
      } catch (err) {
        return res.status(err.status || 500).json({
          status: err.status || 500,
          data: err.data || [],
          message: err.message || "Internal Server Error",
        });
      }
    }
  );

  app.get(
    "/admin_merchants/api/v1/merchants/:cpo_owner_name",
    [AccessTokenVerifier],
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async (req, res) => {
      try {
        if (req.role !== "ADMIN")
          throw new HttpUnauthorized("Unauthorized", []);

        const { cpo_owner_name } = req.params;

        logger.info({
          SEARCH_CPO_BY_NAME_REQUEST: {
            cpo_owner_name,
          },
        });

        const result = await service.SearchCPOByName(cpo_owner_name);

        logger.info({
          SEARCH_CPO_BY_NAME_RESPONSE: {
            message: "SUCCESS",
          },
        });

        return res
          .status(200)
          .json({ status: 200, data: result, message: "Success" });
      } catch (err) {
        return res.status(err.status || 500).json({
          status: err.status || 500,
          data: err.data || [],
          message: err.message || "Internal Server Error",
        });
      }
    }
  );

  app.patch(
    "/admin_merchants/api/v1/merchants/:id",
    [
      AccessTokenVerifier,
      body("cpo_owner_name")
        .optional()
        .notEmpty()
        .withMessage("Missing required property: cpo_owner_name")
        .escape()
        .trim(),
      body("contact_name")
        .optional()
        .notEmpty()
        .withMessage("Missing required property: contact_person")
        .escape()
        .trim(),
      body("contact_number")
        .optional()
        .notEmpty()
        .withMessage("Missing required property: contact_number")
        .escape()
        .trim(),
      body("contact_email")
        .optional()
        .notEmpty()
        .withMessage("Missing required property: contact_email")
        .isEmail()
        .withMessage("Please provide a valid contact_email")
        .escape()
        .trim(),
      body("username")
        .optional()
        .notEmpty()
        .withMessage("Missing required property: username")
        .escape()
        .trim(),
    ],

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async (req, res) => {
      try {
        logger.info({
          UPDATE_CPO_BY_ID_REQUEST: {
            id: req.params.id,
            ...req.body,
          },
        });

        if (req.role !== "ADMIN")
          throw new HttpUnauthorized("Unauthorized", []);

        validate(req, res);

        const result = await service.UpdateCPOByID({
          id: req.params.id,
          data: { ...req.body },
        });

        logger.info({
          UPDATE_CPO_BY_ID_RESPONSE: {
            message: "SUCCESS",
          },
        });
        return res
          .status(200)
          .json({ status: 200, data: result, message: "Success" });
      } catch (err) {
        return res.status(err.status || 500).json({
          status: err.status || 500,
          data: err.data || [],
          message: err.message || "Internal Server Error",
        });
      }
    }
  );

  app.post(
    "/admin_merchants/api/v1/merchants/rfid/:cpo_owner_id/:rfid_card_tag",
    [AccessTokenVerifier],

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async (req, res) => {
      try {
        const { cpo_owner_id, rfid_card_tag } = req.params;

        logger.info({
          ADD_RFID_REQUEST: {
            cpo_owner_id,
            rfid_card_tag,
          },
        });

        const result = await service.AddRFID(cpo_owner_id, rfid_card_tag);

        logger.info({
          ADD_RFID_RESPONSE: {
            message: "SUCCESS",
          },
        });

        return res
          .status(200)
          .json({ status: 200, data: result, message: "Success" });
      } catch (err) {
        return res.status(err.status || 500).json({
          status: err.status || 500,
          data: err.data || [],
          message: err.message || "Internal Server Error",
        });
      }
    }
  );

  app.post(
    "/admin_merchants/api/v1/merchants/topup/:cpo_owner_id",
    [AccessTokenVerifier],

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async (req, res) => {
      try {
        const { cpo_owner_id } = req.params;
        const { amount } = req.body;

        logger.info({
          CPO_TOPUP: {
            cpo_owner_id: req.params.cpo_owner_id,
            amount: req.body.amount,
          },
        });

        const result = await service.Topup(cpo_owner_id, amount);

        return res
          .status(200)
          .json({ status: 200, data: result, message: "Success" });
      } catch (err) {
        return res.status(err.status || 500).json({
          status: err.status || 500,
          data: err.data || [],
          message: err.message || "Internal Server Error",
        });
      }
    }
  );

  app.get(
    "/admin_merchants/api/v1/merchants/topups/:cpo_owner_id",
    [AccessTokenVerifier],

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async (req, res) => {
      try {
        logger.info({
          GET_TOPUP_LOGS: {
            cpo_owner_id: req.params.cpo_owner_id,
          },
        });

        const { cpo_owner_id } = req.params;

        const result = await service.GetTopupByID(cpo_owner_id);

        logger.info({
          GET_TOPUP_LOGS_RESPONSE: {
            message: "SUCCESS",
          },
        });

        return res
          .status(200)
          .json({ status: 200, data: result, message: "Success" });
      } catch (err) {
        return res.status(err.status || 500).json({
          status: err.status || 500,
          data: err.data || [],
          message: err.message || "Internal Server Error",
        });
      }
    }
  );
};
