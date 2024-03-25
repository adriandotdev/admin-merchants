const mysql = require("../database/mysql");

module.exports = class MerchantRepository {
	GetMerchants() {
		const QUERY = `SELECT * FROM cpo_owners`;
		return new Promise((resolve, reject) => {
			mysql.query(QUERY, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
