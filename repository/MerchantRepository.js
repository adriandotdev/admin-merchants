const mysql = require("../database/mysql");

module.exports = class MerchantRepository {
	GetCPOs() {
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

	RegisterCPO({
		party_id,
		cpo_owner_name,
		contact_name,
		contact_number,
		contact_email,
		username,
		password,
	}) {
		const QUERY = `CALL WEB_ADMIN_REGISTER_CPO(?,?,?,?,?,?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(
				QUERY,
				[
					party_id,
					cpo_owner_name,
					contact_name,
					contact_number,
					contact_email,
					username,
					password,
				],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}
};
