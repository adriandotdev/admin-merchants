const mysql = require("../database/mysql");

module.exports = class MerchantRepository {
	GetCPOs(data) {
		const QUERY = `
			SELECT 
				users.username, 
				cpo_owners.* 
			FROM cpo_owners 
			INNER JOIN users ON cpo_owners.user_id = users.id
			LIMIT ? OFFSET ?
		`;

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

	CheckRegisterCPO(type, value) {
		const QUERY = `CALL WEB_ADMIN_CHECK_REGISTER_CPO(?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [type, value], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	/**
	 * @param {String} cpoOwnerName
	 * @returns {Promise<Object>}
	 */
	SearchCPOByName(cpoOwnerName) {
		const QUERY = `
			SELECT 
				users.username, 
				cpo_owners.* 
			FROM cpo_owners
			INNER JOIN users ON cpo_owners.user_id = users.id
			WHERE 
				LOWER(cpo_owner_name) LIKE ?
		`;

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
		const QUERY = `
			UPDATE 
				cpo_owners
			INNER JOIN users ON cpo_owners.user_id = users.id
			${query} 
			WHERE 
				cpo_owners.id = ?`;

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

	Topup(cpoOwnerID, amount) {
		const QUERY = `CALL WEB_ADMIN_TOPUP(?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [cpoOwnerID, amount], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetTopupByID(cpoOwnerID) {
		const QUERY = `
			SELECT 
				topup_logs.*, 
				topup_logs.id, 
				DATE_ADD(topup_logs.date_created, INTERVAL 60 MINUTE) AS voidable_until
			FROM topup_logs
			INNER JOIN cpo_owners ON cpo_owners.user_id = topup_logs.user_id
			WHERE 
				cpo_owners.id = ?
				AND NOW() < DATE_ADD(topup_logs.date_created, INTERVAL 60 MINUTE) 
				AND type = 'TOPUP'
				AND void_id IS NULL
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [cpoOwnerID], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	VoidTopup(referenceID) {
		const QUERY = `CALL WEB_ADMIN_VOID_TOPUP(?)`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, referenceID, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	DeactivateCPOAccount(userID) {
		const QUERY = `
			UPDATE 
				users
			SET 
				user_status = 'INACTIVE'
			WHERE 
				id = ?
				AND role = 'CPO_OWNER'
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, userID, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	ActivateCPOAccount(userID) {
		const QUERY = `
			UPDATE 
				users
			SET 
				user_status = 'ACTIVE'
			WHERE 
				id = ?
				AND role = 'CPO_OWNER'
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, userID, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetCompanyPartnerDetails() {
		const QUERY = `

			SELECT 
				*
			FROM
				company_partner_details
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	RegisterCompanyPartnerDetails({ company_name, party_id, country_code }) {
		const QUERY = `
			INSERT INTO 
				company_partner_details (company_name, party_id, country_code, account_status, date_created, date_modified)
			VALUES (
				?,?,?,'ACTIVE',NOW(), NOW()
			)
		`;

		return new Promise((resolve, reject) => {
			mysql.query(
				QUERY,
				[company_name, party_id, country_code],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	AuditTrail({ admin_id, cpo_id, action, remarks }) {
		const QUERY = `
			INSERT INTO 
				admin_audit_trails (admin_id, cpo_id, action, remarks, date_created, date_modified)
			VALUES (
				?,?,?,?,NOW(),NOW()
			)
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [admin_id, cpo_id, action, remarks], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
