Document V2
Create a document
POST
/
v2
/
doc

Try it
Customer id and Product id should be unique, if a new id is sent, a new Customer/Product with given details will be automatically created. For Product If an existing id is sent, the details will not override the original product details. They will be applicable only to the current document. For updating the product details, use the update product API
Authorizations
​
Authorization
stringheaderrequired
Bearer authentication header of the form Bearer , where is your auth token.

Body
application/json
​
document_type
enum<string>required
Value should always be the string 'invoice'

Available options: invoice, subscription, pro_forma_invoice, estimate, sales_return, purchase_return, delivery_challan, purchase 
Example:
"invoice"

​
document_date
stringrequired
DD-MM-YYYY

Example:
"11-06-2024"

​
items
object[]required
Array of Products/Services, refer Item Object below for parameters

Show child attributes

​
serial_number
string
Serial Number (deprecated, please use New Serial Number)

Example:
"INV123"

​
serial_number_v2
object
Show child attributes

Example:
{
  "prefix": "INV",
  "doc_number": 1,
  "suffix": "2024"
}
​
party
object
Party. If there are any changes made to the party details, we will update those details and any documents linked to this party ID will be updated to reflect the changes.

Show child attributes

​
due_date
string
DD-MM-YYYY

Example:
"11-06-2024"

​
reference
string
Any references you want to add to the doc

Example:
"Reference Text"

​
notes
string
Notes to show in invoice - please check template in swipe application to see where this is displayed

Example:
"Notes for the document"

​
terms
string
Terms to show in invoice - please check template in swipe application to see where this is displayed

Example:
"Terms and Conditions"

​
warehouse_id
integer
Warehouse ID

Example:
-1

​
extra_discount
number
Adjustment on overall invoice, doesn’t effect any tax amounts.

Example:
20

​
round_off
booleandefault:false
Should Round Off total amount

Example:
true

​
payments
object[]
Array of Payments, refer Payment Object for parameters

Show child attributes

​
bank_details
object
Bank Details, it is used to display bank details in document PDFs. No payments are associated with these bank details.

Show child attributes

​
tds_id
integer
You can check the tds id and details mapping from https://developers.getswipe.in/api-reference/references#tds-tax-deducted-at-source

​
tcs_id
integer
You can check the tcs id and details mapping from https://developers.getswipe.in/api-reference/references#tcs-tax-collected-at-source

​
charges_and_deductions
object[]
Array of Charges and Deductions, refer Additional Charges Deductions Object for parameters

Show child attributes

​
company_shipping_address
object
Company shipping from Address, refer Shipping Address Object for parameters

Show child attributes

​
company_billing_address
object
Company billing Address, refer Billing Address Object for parameters

Show child attributes

​
einvoice
boolean
Generate einvoice

Example:
false

​
is_export
boolean
Is Export

Example:
false

​
is_multi_currency
boolean
Is Multi Currency

Example:
false

​
export_invoice_details
object
Export Invoice Details

Show child attributes

​
is_subscription
boolean
Is Subscription

Example:
false

​
subscription_details
object
Subscription Details

Show child attributes

​
convert
object
Convert Document. Needed only when the document is already created and you want to convert it to another document

Show child attributes

​
custom_headers
object[]
Document Custom Headers. Custom headers should already be added in Swipe Portal.

Show child attributes

Example:
[
  {
    "label": "Custom Header 1",
    "value": "Value 1"
  }
]
Response

200

application/json
Success

​
success
booleandefault:true
Example:
true

​
message
string
Success Message

Example:
"Message"

​
error_code
string
Error Code

Example:
""

​
errors
object
Error details

​
data
object
Show child attributes


Document V2
Get a document
GET
/
v2
/
doc
/
{doc_hash_id}

Try it
Authorizations
​
Authorization
stringheaderrequired
Bearer authentication header of the form Bearer , where is your auth token.

Path Parameters
​
doc_hash_id
stringrequired
The hash id of the document to be fetched

Response

200

application/json
Success

​
success
boolean
Success flag

Example:
true

​
message
string
Message

Example:
"Details Fetched"

​
error_code
string
Error code

Example:
""

​
errors
object
Error details

​
data
object
Hide child attributes

​
data.invoice_details
object
Hide child attributes

​
data.invoice_details.serial_number
string
Invoice number assigned to document

Example:
"INV-12"

​
data.invoice_details.document_type
string
Document type

Example:
"invoice"

​
data.invoice_details.document_date
string
Transaction date [DD-MM-YYYY]

Example:
"11-06-2024"

​
data.invoice_details.party
object
Party Details for the document

Show child attributes

​
data.invoice_details.due_date
string
Transaction date [DD-MM-YYYY]

Example:
"11-06-2024"

​
data.invoice_details.amount_paid
number
Amount Paid for the document

Example:
28

​
data.invoice_details.amount_pending
number
Remaining amount to be paid for the document

Example:
90

​
data.invoice_details.reference
string
Reference Text

​
data.invoice_details.notes
string
Notes for the document

​
data.invoice_details.terms
string
Terms and Conditions

​
data.invoice_details.items
object[]
List of items in the document

Show child attributes

​
data.invoice_details.is_created_by_recurring
integer
Is the invoice created from subscriptions

Example:
0

​
data.invoice_details.net_amount
number
Net amount of the transaction

Example:
100

​
data.invoice_details.hash_id
string
Hash id for the document

​
data.invoice_details.payment_status
enum<string>
Payment status of the document

Available options: paid, pending, cancelled 
Example:
"paid"

​
data.invoice_details.payments
object[]
List of payments recorded for this document

Show child attributes

​
data.invoice_details.tax_amount
number
Tax amount of the transaction

Example:
18

​
data.invoice_details.total_amount
number
Total amount of the transaction

Example:
118

​
data.invoice_details.total_discount
number
Discount given on this document

Example:
100

​
data.invoice_details.record_time
string
Epoch Timestamp when the document was created

Example:
"1764141027"


Document V2
Get document PDF
GET
/
v2
/
doc
/
pdf
/
{doc_hash_id}

Try it
Authorizations
​
Authorization
stringheaderrequired
Bearer authentication header of the form Bearer , where is your auth token.

Path Parameters
​
doc_hash_id
stringrequired
The hash id of the document to be fetched

Query Parameters
​
delivery_challan
integerdefault:0
Set to 1 if you want to get a delivery challan copy of the document


Document V2
Edit a document
PUT
/
v2
/
doc
/
{doc_hash_id}

Try it
To update a document, include the document’s unique doc_hash_id in the request URL and send all the keys with their updated values in the request body, ensuring the document is updated correctly with the provided data.
Authorizations
​
Authorization
stringheaderrequired
Bearer authentication header of the form Bearer , where is your auth token.

Path Parameters
​
doc_hash_id
stringrequired
The hash ID of the document that needs to be updated.

Body
application/json
​
document_type
enum<string>required
Value should always be the string 'invoice'

Available options: invoice, subscription, pro_forma_invoice, estimate, sales_return, purchase_return, delivery_challan 
Example:
"invoice"

​
document_date
stringrequired
DD-MM-YYYY

Example:
"11-06-2024"

​
items
object[]required
Array of Products/Services, refer Item Object below for parameters

Show child attributes

​
serial_number
string
Serial Number (deprecated, please use New Serial Number)

Example:
"INV123"

​
serial_number_v2
object
Show child attributes

Example:
{
  "prefix": "INV",
  "doc_number": 1,
  "suffix": "2024"
}
​
party
object
Party. If there are any changes made to the party details, we will update those details and any documents linked to this party ID will be updated to reflect the changes.

Show child attributes

​
due_date
string
DD-MM-YYYY

Example:
"11-06-2024"

​
reference
string
Any references you want to add to the doc

Example:
"Reference Text"

​
notes
string
Notes to show in invoice - please check template in swipe application to see where this is displayed

Example:
"Notes for the document"

​
terms
string
Terms to show in invoice - please check template in swipe application to see where this is displayed

Example:
"Terms and Conditions"

​
extra_discount
number
Adjustment on overall invoice, doesn’t effect any tax amounts.

Example:
20

​
round_off
booleandefault:false
Should Round Off total amount

Example:
true

​
bank_details
object
Bank Details, it is used to display bank details in document PDFs. No payments are associated with these bank details.

Show child attributes

​
tds_id
integer
You can check the tds id and details mapping from https://developers.getswipe.in/api-reference/references#tds-tax-deducted-at-source

​
tcs_id
integer
You can check the tcs id and details mapping from https://developers.getswipe.in/api-reference/references#tcs-tax-collected-at-source

​
charges_and_deductions
object[]
Array of Charges and Deductions, refer Additional Charges Deductions Object for parameters

Show child attributes

​
company_shipping_address
object
Company shipping from Address, refer Shipping Address Object for parameters

Show child attributes

​
company_billing_address
object
Company billing Address, refer Billing Address Object for parameters

Show child attributes

​
is_export
boolean
Is Export

Example:
false

​
is_multi_currency
boolean
Is Multi Currency

Example:
false

​
export_invoice_details
object
Export Invoice Details

Show child attributes

​
is_subscription
boolean
Is Subscription

Example:
false

​
subscription_details
object
Subscription Details

Show child attributes

​
convert
object
Convert Document. Needed only when the document is already created and you want to convert it to another document

Show child attributes

​
custom_headers
object[]
Document Custom Headers. Custom headers should already be added in Swipe Portal.

Show child attributes

Example:
[
  {
    "label": "Custom Header 1",
    "value": "Value 1"
  }
]
Response

200

application/json
Success

​
success
booleandefault:true
Example:
true

​
message
string
Success Message

Example:
"Message"

​
error_code
string
Error Code

Example:
""

​
errors
object
Error details

​
data
object
Hide child attributes

​
data.hash_id
string
Hash ID

Example:
"SL123"

​
data.serial_number
string
Serial Number

Example:
"SL123"

​
data.irn
string
IRN

​
data.qr_code
string
QR Code


Document V2
Cancel a document
DELETE
/
v2
/
doc
/
{doc_hash_id}

Try it
Authorizations
​
Authorization
stringheaderrequired
Bearer authentication header of the form Bearer , where is your auth token.

Path Parameters
​
doc_hash_id
stringrequired
The hash id of the document to be cancelled

Query Parameters
​
cancel_einvoice
integerdefault:0
Set to 1 if you want to cancel a document with e-invoice

Response

200

application/json
Success

​
success
booleandefault:true
Example:
true

​
message
string
Success Message

Example:
"Message"

​
error_code
string
Error Code

Example:
""

​
errors
object
Error details

​
data
object
Hide child attributes

​
data.hash_id
string
Hash ID

Example:
"SL123"


Document V2
List of documents
GET
/
v2
/
doc
/
list

Try it
Authorizations
​
Authorization
stringheaderrequired
Bearer authentication header of the form Bearer , where is your auth token.

Query Parameters
​
document_type
enum<string>default:invoicerequired
Available options: invoice, purchase, pro_forma_invoice, estimate, sales_return, purchase_return, delivery_challan, purchase_order 
​
start_date
stringdefault:01-01-2024required
Start date for the list, [DD-MM-YYY]

​
end_date
stringdefault:31-12-2024required
End date for the list, [DD-MM-YYY]

​
payment_status
enum<string>default:all
Filter list based on payment status of the document.

Available options: all, pending, paid, cancelled 
​
num_records
stringdefault:10
Number of records to fetch max(100)

​
page
integerdefault:1
Page number

​
customer_id
string
Customer ID

Response

200

application/json
Documents List fetched successfully

​
success
boolean
Success flag

Example:
true

​
message
string
Message

Example:
"Details Fetched"

​
error_code
string
Error code

Example:
""

​
errors
object
Error details

​
data
object
Hide child attributes

​
data.transactions
object[]
List of transactions

Show child attributes

​
data.total_records
integer
Total number of records

Example:
10




curl --request POST \
  --url https://app.getswipe.in/api/partner/v2/doc \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "document_type": "invoice",
  "document_date": "15-11-2024",
  "due_date": "15-11-2024",
  "party": {
    "id": "CUST123",
    "type": "customer",
    "name": "John Doe"
  },
  "items": [
    {
      "id": "ITEM123455667ghg",
      "name": "Item Namgergggree",
      "quantity": 1,
      "unit_price": 200,
      "tax_rate": 18,
      "price_with_tax": 236,
      "net_amount": 200,
      "total_amount": 236,
      "item_type": "Product"
    }
  ]
}
'

200

400

401

500
{
  "success": true,
  "message": "Message",
  "error_code": "",
  "errors": {},
  "data": {
    "hash_id": "SL123",
    "serial_number": "SL123",
    "irn": "<string>",
    "qr_code": "<string>"
  }
}



Get a document

curl --request GET \
  --url https://app.getswipe.in/api/partner/v2/doc/{doc_hash_id} \
  --header 'Authorization: Bearer <token>'

200

400

401

404

500
{
  "success": true,
  "message": "Details Fetched",
  "error_code": "",
  "errors": {},
  "data": {
    "invoice_details": {
      "serial_number": "INV-12",
      "document_type": "invoice",
      "document_date": "11-06-2024",
      "party": {
        "id": "CUST123",
        "type": "customer",
        "name": "John Doe",
        "country_code": "91",
        "phone_number": "1234567890",
        "company_name": "Company Name",
        "email": "johndoe@example.com",
        "gstin": "27AARCS7202C1ZD",
        "shipping_address": {
          "address_line1": "123 Street",
          "address_line2": "Apt 4B",
          "city": "City Name",
          "state": "State Name",
          "country": "Country Name",
          "pincode": "123456",
          "addr_id": -1,
          "addr_id_v2": "addr1"
        },
        "billing_address": {
          "address_line1": "123 Street",
          "address_line2": "Apt 4B",
          "city": "City Name",
          "state": "State Name",
          "country": "Country Name",
          "pincode": "123456",
          "addr_id": -1,
          "addr_id_v2": "addr1"
        }
      },
      "due_date": "11-06-2024",
      "amount_paid": 28,
      "amount_pending": 90,
      "reference": "<string>",
      "notes": "<string>",
      "terms": "<string>",
      "items": [
        {
          "id": "ITEM123",
          "name": "Item Name",
          "quantity": 1,
          "unit_price": 100,
          "price_with_tax": 118,
          "net_amount": 100,
          "total_amount": 118,
          "item_type": "Product",
          "tax_rate": 18,
          "discount_percent": 10,
          "discount_amount": 10,
          "description": "Item Description",
          "hsn_code": "1234",
          "unit": "kg",
          "category": "Electronics",
          "custom_columns": [
            {
              "label": "Custom Field 1",
              "value": "Value 1"
            }
          ]
        }
      ],
      "is_created_by_recurring": 0,
      "net_amount": 100,
      "hash_id": "<string>",
      "payment_status": "paid",
      "payments": [
        {
          "amount": 100,
          "method": "upi",
          "notes": "Payment notes",
          "bank_details": {
            "account_number": "1234567890",
            "ifsc": "SBIN0000001",
            "bank_name": "State Bank of India",
            "branch": "Mumbai"
          }
        }
      ],
      "tax_amount": 18,
      "total_amount": 118,
      "total_discount": 100,
      "record_time": "1764141027"
    }
  }
}


curl --request GET \
  --url https://app.getswipe.in/api/partner/v2/doc/pdf/{doc_hash_id} \
  --header 'Authorization: Bearer <token>'

200

400

401

500
This response has no body data.


cURL

curl --request PUT \
  --url https://app.getswipe.in/api/partner/v2/doc/{doc_hash_id} \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "document_type": "invoice",
  "document_date": "11-06-2024",
  "items": [
    {
      "id": "ITEM123",
      "name": "Item Name",
      "quantity": 1,
      "unit_price": 100,
      "price_with_tax": 118,
      "net_amount": 100,
      "total_amount": 118,
      "item_type": "Product",
      "tax_rate": 18,
      "discount_percent": 10,
      "discount_amount": 10,
      "description": "Item Description",
      "hsn_code": "1234",
      "unit": "kg",
      "category": "Electronics",
      "custom_columns": [
        {
          "label": "Custom Field 1",
          "value": "Value 1"
        }
      ]
    }
  ],
  "serial_number": "INV123",
  "serial_number_v2": {
    "prefix": "INV",
    "doc_number": 1,
    "suffix": "2024"
  },
  "party": {
    "id": "CUST123",
    "type": "customer",
    "name": "John Doe",
    "country_code": "91",
    "phone_number": "1234567890",
    "company_name": "Company Name",
    "email": "johndoe@example.com",
    "gstin": "27AARCS7202C1ZD",
    "shipping_address": {
      "address_line1": "123 Street",
      "address_line2": "Apt 4B",
      "city": "City Name",
      "state": "State Name",
      "country": "Country Name",
      "pincode": "123456",
      "addr_id": -1,
      "addr_id_v2": "addr1"
    },
    "billing_address": {
      "address_line1": "123 Street",
      "address_line2": "Apt 4B",
      "city": "City Name",
      "state": "State Name",
      "country": "Country Name",
      "pincode": "123456",
      "addr_id": -1,
      "addr_id_v2": "addr1"
    }
  },
  "due_date": "11-06-2024",
  "reference": "Reference Text",
  "notes": "Notes for the document",
  "terms": "Terms and Conditions",
  "extra_discount": 20,
  "round_off": false,
  "bank_details": {
    "account_number": "1234567890",
    "ifsc": "SBIN0000001",
    "bank_name": "State Bank of India",
    "branch": "Mumbai"
  },
  "tds_id": 123,
  "tcs_id": 123,
  "charges_and_deductions": [
    {
      "id": 1,
      "name": "Delivery Charge",
      "amount": 100,
      "tax_rate": 18,
      "type": "charge",
      "sac_code": "1234"
    }
  ],
  "company_shipping_address": {
    "address_line1": "123 Street",
    "address_line2": "Apt 4B",
    "city": "City Name",
    "state": "State Name",
    "country": "Country Name",
    "pincode": "123456",
    "addr_id": -1,
    "addr_id_v2": "addr1"
  },
  "company_billing_address": {
    "address_line1": "123 Street",
    "address_line2": "Apt 4B",
    "city": "City Name",
    "state": "State Name",
    "country": "Country Name",
    "pincode": "123456",
    "addr_id": -1,
    "addr_id_v2": "addr1"
  },
  "is_export": false,
  "is_multi_currency": false,
  "export_invoice_details": {
    "export_type": "With Payment of Tax",
    "conversion_factor": 123,
    "shipping_bill_date": "14-02-2024",
    "shipping_bill_number": "123456",
    "shipping_port_code": "123456",
    "country_id": "Afghanistan",
    "currency_id": "AED"
  },
  "is_subscription": false,
  "subscription_details": {
    "start_time": "1919-08-17T00:00:00.000Z",
    "end_time": "1919-08-18T00:00:00.000Z",
    "repeat": 1,
    "repeat_type": "days",
    "send_email": true,
    "send_sms": true
  },
  "convert": {
    "convert_from": "invoice",
    "hash_id": "SL123"
  },
  "custom_headers": [
    {
      "label": "Custom Header 1",
      "value": "Value 1"
    }
  ]
}
'

200

400

401

500
{
  "success": true,
  "message": "Message",
  "error_code": "",
  "errors": {},
  "data": {
    "hash_id": "SL123",
    "serial_number": "SL123",
    "irn": "<string>",
    "qr_code": "<string>"
  }
}


Cancel a document

curl --request DELETE \
  --url https://app.getswipe.in/api/partner/v2/doc/{doc_hash_id} \
  --header 'Authorization: Bearer <token>'

200

400

401

404

500
{
  "success": true,
  "message": "Message",
  "error_code": "",
  "errors": {},
  "data": {
    "hash_id": "SL123"
  }
}


List of documents

curl --request GET \
  --url 'https://app.getswipe.in/api/partner/v2/doc/list?document_type=invoice&start_date=01-01-2024&end_date=31-12-2024&payment_status=all&num_records=10&page=1' \
  --header 'Authorization: Bearer <token>'

200

400

401

500
{
  "success": true,
  "message": "Details Fetched",
  "error_code": "",
  "errors": {},
  "data": {
    "transactions": [
      {
        "serial_number": "INV-12",
        "document_date": "11-06-2024",
        "customer": {
          "id": "CUST123",
          "name": "John Doe",
          "country_code": "91",
          "phone_number": "1234567890",
          "company_name": "Company Name",
          "email": "johndoe@example.com",
          "gstin": "27AARCS7202C1ZD"
        },
        "due_date": "11-06-2024",
        "amount_paid": 28,
        "amount_pending": 90,
        "reference": "<string>",
        "notes": "<string>",
        "terms": "<string>",
        "is_created_by_recurring": 0,
        "net_amount": 100,
        "hash_id": "<string>",
        "payment_status": "paid",
        "payments": [
          {
            "amount": 100,
            "method": "upi",
            "notes": "Payment notes",
            "bank_details": {
              "account_number": "1234567890",
              "ifsc": "SBIN0000001",
              "bank_name": "State Bank of India",
              "branch": "Mumbai"
            }
          }
        ],
        "tax_amount": 18,
        "total_amount": 118,
        "total_discount": 100
      }
    ],
    "total_records": 10
  }
}