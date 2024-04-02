const TokenMiddleware = require("../middlewares/TokenMiddleware");
const {
	ROLES,
	RoleManagementMiddleware,
} = require("../middlewares/RoleManagementMiddleware");
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
	const tokenMiddleware = new TokenMiddleware();
	const rolesMiddleware = new RoleManagementMiddleware();
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
		[
			tokenMiddleware.AccessTokenVerifier(),
			rolesMiddleware.CheckRole(ROLES.ADMIN, ROLES.ADMIN_MARKETING),
		],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				logger.info({
					GET_CPOS_REQUEST: {
						role: req.role,
						limit: req.query.limit,
						offset: req.query.offset,
					},
				});

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

				logger.info({
					GET_CPOS_RESPONSE: {
						message: "Success",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					GET_CPOS_ERROR: {
						err,
						message: err.message,
					},
				});
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
			tokenMiddleware.AccessTokenVerifier(),
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
				logger.info({
					REGISTER_CPO_REQUEST: {
						role: req.role,
						data: { ...req.body },
					},
				});

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
				logger.error({
					REGISTER_CPO_ERROR: {
						err,
						message: err.message,
					},
				});
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
		[tokenMiddleware.AccessTokenVerifier()],
		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				logger.info({
					SEARCH_CPO_BY_NAME_REQUEST: {
						role: req.role,
						cpo_owner_name: req.params.cpo_owner_name,
					},
				});

				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

				const { cpo_owner_name } = req.params;

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
				logger.error({
					SEARCH_CPO_BY_NAME_ERROR: {
						err,
						message: err.message,
					},
				});
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
			tokenMiddleware.AccessTokenVerifier(),
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
						role: req.role,
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
				logger.error({
					UPDATE_CPO_BY_ID_ERROR: {
						err,
						message: err.message,
					},
				});
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
		[tokenMiddleware.AccessTokenVerifier()],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				const { cpo_owner_id, rfid_card_tag } = req.params;

				logger.info({
					ADD_RFID_REQUEST: {
						role: req.role,
						cpo_owner_id,
						rfid_card_tag,
					},
				});

				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

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
				logger.error({
					ADD_RFID_ERROR: {
						err,
						message: err.message,
					},
				});
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
		[tokenMiddleware.AccessTokenVerifier()],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				const { cpo_owner_id } = req.params;
				const { amount } = req.body;

				logger.info({
					TOPUP_TO_CPO_REQUEST: {
						role: req.role,
						cpo_owner_id,
						amount,
					},
				});

				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

				const result = await service.Topup(cpo_owner_id, amount);

				logger.info({
					TOPUP_TO_CPO_RESPONSE: {
						message: "SUCCESS",
					},
				});
				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					TOPUP_TO_CPO_RESPONSE: {
						err,
						message: err.message,
					},
				});
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
		[tokenMiddleware.AccessTokenVerifier()],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				const { cpo_owner_id } = req.params;

				logger.info({
					GET_TOPUP_LOGS: {
						role: req.role,
						cpo_owner_id,
					},
				});

				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

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
				logger.error({
					GET_TOPUP_LOGS_ERROR: {
						err,
						message: err.message,
					},
				});
				return res.status(err.status || 500).json({
					status: err.status || 500,
					data: err.data || [],
					message: err.message || "Internal Server Error",
				});
			}
		}
	);

	app.post(
		"/admin_merchants/api/v1/merchants/topups/void/:reference_id",
		[tokenMiddleware.AccessTokenVerifier()],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				const { reference_id } = req.params;

				logger.info({
					VOID_TOPUP_REQUEST: {
						reference_id,
					},
				});

				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

				const result = await service.VoidTopup(reference_id);

				logger.info({
					VOID_TOPUP_RESPONSE: {
						message: "Success",
					},
				});
				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					VOID_TOPUP_ERROR: {
						err,
						message: err.message,
					},
				});
				return res.status(err.status || 500).json({
					status: err.status || 500,
					data: err.data || [],
					message: err.message || "Internal Server Error",
				});
			}
		}
	);
};
