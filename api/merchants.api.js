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
		async (req, res) => {
			try {
				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

				const result = await service.GetCPOs();

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
};
