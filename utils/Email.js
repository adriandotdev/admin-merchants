const nodemailer = require("nodemailer");
const logger = require("../config/winston");

const transporter = nodemailer.createTransport({
	name: process.env.NODEMAILER_NAME || "",
	host: process.env.NODEMAILER_HOST,
	port: process.env.NODEMAILER_PORT,
	secure:
		process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "test"
			? false
			: true,
	auth: {
		user: process.env.NODEMAILER_USER,
		pass: process.env.NODEMAILER_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

module.exports = class Email {
	constructor(email_address, data) {
		this._email_address = email_address;
		this._data = data;
	}

	async SendUsernameAndPassword() {
		logger.info({
			CLASS_EMAIL_SEND_USERNAME_AND_PASSWORD_METHOD: {
				email: this._email_address,
				from: process.env.NODEMAILER_USER,
				to: this._email_address,
				otp: this._data.otp,
			},
		});

		try {
			let htmlFormat = `
			  <h1>ParkNcharge</h1>
	
			  <h2>PLEASE DO NOT SHARE THIS TO ANYONE</h2>
			  
			  <p>Username: ${this._data.username}</p>
			  <p>Password: ${this._data.password}</p>

			  <p>Kind regards,</p>
			  <p><b>ParkNcharge</b></p>
			`;

			let textFormat = `<h1>ParkNcharge</h1>
	
			<h2>PLEASE DO NOT SHARE THIS TO ANYONE</h2>
			
			<p>Username: ${this._data.username}</p>
			<p>Password: ${this._data.password}</p>

			<p>Kind regards,</p>
			<p><b>ParkNcharge</b></p>`;

			// send mail with defined transport object
			const info = await transporter.sendMail({
				from: process.env.NODEMAILER_USER, // sender address
				to: this._email_address, // list of receivers
				subject: "ParkNcharge Credentials (no-reply)", // Subject line
				text: textFormat, // plain text body
				html: htmlFormat, // html body
			});

			logger.info({
				CLASS_EMAIL_SEND_USERNAME_AND_PASSWORD_METHOD: {
					message: info.messageId,
				},
			});
		} catch (err) {
			logger.error({ CLASS_EMAIL_SEND_USERNAME_AND_PASSWORD_METHOD: { err } });
			throw new Error({ connection: data.connection });
		}
	}
};
