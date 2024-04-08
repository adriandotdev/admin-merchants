# Admin Merchants API

## URL

`https://services-parkncharge.sysnetph.com/admin_merchants`

## APIs

### GET CPO Owners - `GET /api/v1/merchants?limit=10&offset=0`

### REGISTER CPO Owner - `POST /api/v1/merchants`

Request Body

```json
{
	"party_id": "PNC", // As of now, PNC is the default party_id.
	"cpo_owner_name": "Moses",
	"contact_name": "Prince of Egypt",
	"contact_number": "09341123361",
	"contact_email": "moses@gmail.com",
	"username": "moses"
}
```

### SEARCH CPO by Name - `/api/v1/merchants/:cpo_owner_name`

Parameter: cpo_owner_name

### UPDATE CPO by ID - `/api/v1/merchants/:id`

Parameter: id - ID of the CPO

Request Body

```json
{
	"cpo_owner_name": "update value",
	"contact_name": "update value",
	"contact_number": "update value",
	"contact_email": "update value",
	"username": "update value"
}
```

NOTE: All of the properties are optional. Example you can only update cpo_owner_name, and contact_number.

### ADD / ASSIGN RFID to CPO - `POST /api/v1/merchants/rfid/:cpo_owner_id/:rfid_card_tag`

Parameters:

- cpo_owner_id: Number
- rfid_card_tag: String

### TOPUP to CPO - `POST /api/v1/merchants/topup/:cpo_owner_id`

Parameter:

- cpo_owner_id: Number

Request Body:

```json
    "amount": 150
```

### GET Topups by CPO ID - `GET /api/v1/merchants/topups/:cpo_owner_id`

Parameter:

- cpo_owner_id: Number

### VOID Topup - `POST /api/v1/merchants/topups/void/:reference_id`

Parameter:

- reference_id: Number
