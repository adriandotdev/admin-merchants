const { AccessTokenVerifier } = require("../middlewares/TokenMiddleware");
const MerchantService = require("../services/MerchantService");
const { HttpUnauthorized } = require("../utils/HttpError");

/**
 * @param {import ('express').Express} app
 */
module.exports = (app) => {
	const service = new MerchantService();

	app.get(
		"/admin_merchants/api/v1/merchants",
		[AccessTokenVerifier],
		async (req, res) => {
			try {
				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

				const result = await service.GetMerchants();

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
