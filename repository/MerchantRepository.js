const mysql = require("../database/mysql");

module.exports = class MerchantRepository {
	GetCPOs(data) {
		const QUERY = `SELECT * FROM cpo_owners LIMIT ? OFFSET ?`;

		return new Promise((resolve, reject) => {
			mysql.query(
				QUERY,
				[parseInt(data.limit), parseInt(data.offset)],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
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

	/**
	 * @param {String} cpoOwnerName
	 * @returns {Promise<Object>}
	 */
	SearchCPOByName(cpoOwnerName) {
		const QUERY = `
		SELECT * 
		FROM cpo_owners
		WHERE LOWER(cpo_owner_name) LIKE ?`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [`%${cpoOwnerName}%`], (err, result) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			});
		});
	}

	UpdateCPOByID({ id, query }) {
		const QUERY = `UPDATE cpo_owners
		INNER JOIN users
		ON cpo_owners.user_id = users.id
		${query} WHERE cpo_owners.id = ?`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [id], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	AddRFID(cpoOwnerID, rfidCardTag) {
		const QUERY = `CALL WEB_ADMIN_ADD_RFID(?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [cpoOwnerID, rfidCardTag], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
