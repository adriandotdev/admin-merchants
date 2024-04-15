# Admin Merchants API

## URL

`https://services-parkncharge.sysnetph.com/admin_merchants`

## APIs

### GET CPO Owners - `GET /api/v1/merchants?limit=10&offset=0`

**Description**

Retrieve all of the charging point operators.

**Sample data**

```json
{
	"username": "pnc",
	"id": 1,
	"user_id": 2,
	"party_id": "PNC",
	"cpo_owner_name": "Joel Z Sapul",
	"contact_name": "Marc Hermoso",
	"contact_number": "09665312570",
	"contact_email": "support@sysnetph.com",
	"location_owned_counts": 0,
	"evse_owned_counts": 2,
	"rfid_owned_counts": 0,
	"balance": "700.00",
	"logo": "assets/img/logo/pointer1.png",
	"status": "ACTIVE",
	"date_created": "2024-01-30T06:24:03.000Z",
	"date_modified": "2024-01-30T06:24:05.000Z"
}
```

**Queries**

**limit** - number of objects to return.

**offset** - row start number.

---

### REGISTER CPO Owner - `POST /api/v1/merchants`

**Description**

Registers new Charging Point Operator

**Request**

```json
{
	"party_id": "PNC", // As of now, PNC is the default party_id. (Required)
	"cpo_owner_name": "Moses", // (Required)
	"contact_name": "Prince of Egypt", // (Required)
	"contact_number": "09341123361", // (Required, and unique)
	"contact_email": "moses@gmail.com", // (Required, and unique)
	"username": "moses" // (Required, and unique)
}
```

**Response**

```json
{
	"status": 200,
	"data": "SUCCESS",
	"message": "Success"
}
```

**Error Messages**

**CONTACT_NUMBER_DOES_EXISTS**

**CONTACT_EMAIL_DOES_EXISTS**

**USERNAME_DOES_EXISTS**

---

### SEARCH CPO by Name - `/api/v1/merchants/:cpo_owner_name`

**Description**

Search charging point operator by its name.

**Parameters**

**cpo_owner_name** - Charging Point Operator's name.

**Sample Data Response**

```json
{
	"username": "pnc",
	"id": 1,
	"user_id": 2,
	"party_id": "PNC",
	"cpo_owner_name": "Joel Z Sapul",
	"contact_name": "Marc Hermoso",
	"contact_number": "09665312570",
	"contact_email": "support@sysnetph.com",
	"location_owned_counts": 0,
	"evse_owned_counts": 2,
	"rfid_owned_counts": 0,
	"balance": "700.00",
	"logo": "assets/img/logo/pointer1.png",
	"status": "ACTIVE",
	"date_created": "2024-01-30T06:24:03.000Z",
	"date_modified": "2024-01-30T06:24:05.000Z"
}
```

---

### UPDATE CPO by ID - `/api/v1/merchants/:id`

**Description**

Updates Charging Point Operator's details

**Parameters**

**id** - Charging Point Operator's ID.

**Request Body**

```json
{
	"cpo_owner_name": "Value", // (Optional)
	"contact_name": "Value", // (Optional)
	"contact_number": "Value", // (Optional)
	"contact_email": "Value", // (Optional)
	"username": "Value" // (Optional)
}
```

**Response**

```json
{
	"status": 200,
	"data": "SUCCESS" // or "NO_CHANGES_APPLIED",
	"message": "Success"
}
```

**Errors**

**CPO_ID_DOES_NOT_EXISTS**

> **NOTE**: All of the properties are optional. Example you can only update cpo_owner_name, and contact_number.

---

### ADD / ASSIGN RFID to CPO - `POST /api/v1/merchants/rfid/:cpo_owner_id/:rfid_card_tag`

**Description**

Assigns or add RFID to Charging Point Operators.

**Parameters**

**cpo_owner_id**

- Charging Point Operator's ID.
- Type: Number

**rfid_card_tag**

- RFID's tag to be added.
- Type: String

**Response**

```json
{
	"status": 200,
	"data": "SUCCESS",
	"message": "Success"
}
```

**Errors**

**RFID_EXISTS**

---

### TOPUP to CPO - `POST /api/v1/merchants/topup/:cpo_owner_id`

**Description**

Topups to Charging Point Operator's account.

**Parameters**

**cpo_owner_id**

- Charging Point Operator's ID
- Type: Number

**Request Body**

```json
{
	"amount": 150
}
```

**Response**

```json
{
	"status": 200,
	"data": {
		"status": "SUCCESS",
		"new_balance": "850.00"
	},
	"message": "Success"
}
```

**Errors**

**CPO_OWNER_ID_DOES_NOT_EXISTS**

**INVALID_AMOUNT**

---

### GET Topups by CPO ID - `GET /api/v1/merchants/topups/:cpo_owner_id`

**Description**

Get all of the topups of the Charging Point Operator based on its ID.

**Parameter**

**cpo_owner_id**

- Charging Point Operator's ID
- Type: Number

**Sample Topup Object**

```json
{
	"id": 59,
	"user_id": 2,
	"user_type": "CPO_OWNER",
	"amount": "150.00",
	"type": "TOPUP",
	"cpo_owner_id": 1,
	"payment_type": "CARD",
	"payment_status": "success",
	"transaction_id": null,
	"client_key": null,
	"topup_income": null,
	"topup_income_setting": null,
	"description": null,
	"void_id": null,
	"date_created": "2024-04-15T01:58:39.000Z",
	"date_modified": "2024-04-15T01:58:39.000Z",
	"voidable_until": "2024-04-15T02:58:39.000Z"
}
```

---

### VOID Topup - `POST /api/v1/merchants/topups/void/:reference_id`

**Description**

Voids a topup based on reference id or id.

**Parameters**

**reference_id**

- Topup's reference id.
- Type: Number

**Response**

```json
{
	"status": 200,
	"data": {
		"status": "SUCCESS",
		"current_balance": "1000.00",
		"reference_number": 59
	},
	"message": "Success"
}
```
