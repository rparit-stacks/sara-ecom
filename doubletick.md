Send WhatsApp Template Message
Send WhatsApp template messages via the DoubleTick API for reliable, structured, and automated customer communication. 🚀

Suggest Edits
API Endpoint
Use the following endpoint to send a template message:


POST https://public.doubletick.io/whatsapp/message/template
Request Headers
JSON

{
  "Authorization": "YOUR_API_KEY",
  "Content-Type": "application/json"
}
Request Body Parameters
JSON

{
  "messages": [
    {
      "content": {
        "language": "en",
        "templateData": {
          "header": {
            "type": "TEXT",
            "placeholder": "Header text",
            "mediaUrl": "https://example.com/image.png",
            "filename": "Document caption",
            "latitude": -23.5505199,
            "longitude": -46.6333094
          },
          "body": {
            "placeholders": [
              "Body text",
              "Body text2"
            ]
          },
          "buttons": [
            {
              "type": "URL",
              "parameter": "Button text"
            },
            {
              "type": "URL",
              "parameter": "Button text2"
            }
          ],
          "cards": [
            {
              "components": {
                "header": {
                  "type": "IMAGE",
                  "mediaUrl": "https://example.com/image.png"
                },
                "body": {
                  "placeholders": [
                    "Body text",
                    "Body text2"
                  ]
                },
                "buttons": [
                  {
                    "type": "URL",
                    "parameter": "Button text"
                  },
                  {
                    "type": "URL",
                    "parameter": "Button text2"
                  }
                ]
              },
              "cardIndex": 1
            }
          ]
        },
        "templateName": "your_template_name"
      },
      "from": "sender_number",
      "to": "customer_number",
      "messageId": "uuid-v4xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  ]
}
Parameters
messages (array of objects, required)
to (string, required): Customer’s phone number in international format.
from (string, required): Your registered sender phone number in international format.
messageId (string, optional):
Message ID (UUID v4) to be used for the message.
If not provided, a random UUID v4 will be generated automatically.
Length to be exact 36 characters.
content (object, required)
templateName (string, required): Name of your template.
language (string, required): Language code of the template (e.g., "en", "es").
templateData (object, optional): Editable components of the template including the header, body, buttons and cards.
header (object, optional)
type (string, optional): The type of the header (e.g, TEXT, IMAGE, DOCUMENT, VIDEO, LOCATION).
placeholder (string, optional): Placeholder text for the header.
mediaUrl (string, optional): URL of the media to be displayed in the header.
filename (string, optional): File URL to attach to the header.
longitude (number, optional): Longitude for location-based templated.
latitude (number, optional): Latitude for location-based templates.
body (object, optional): The body section of the template.
placeholders (array of strings, optional): Dynamic values to be inserted into the template.
buttons (array, optional): Interactive buttons
type (string, required): The button type (eg., URL).
parameter (string, required): Text or link parameter for the button.
Limit to be only 1 button per template
cards (array of objects, optional) An array of card components for multi-item messaging.
components (object, optional): Similar to the main template header but specific to a card.
header (object, optional)
body (object, optional)
buttons (array, optional)
cardIndex (number, optional)
Responses
Success Response (201)
JSON

{
  "status": "SENT",
  "recipient": "customer_number",
  "messageId": "unique_message_id"
}
Bad Request (400)
JSON

{
  "message": "error_message",
  "error": "Bad Request",
  "statusCode": 400
}
Unauthorized (401)
JSON

{
  "message": "Invalid public api key",
  "error": "Unauthorized",
  "statusCode": 401
}
Unprocessable Entity (422)
JSON

{
  "message": "invalid file type for audio: text/html; charset=utf-8",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
Best Practices
Keep placeholders relevant and ensure the values match the intended format.
Use interactive buttons where applicable to enhance engagement.
Use single template message at a time to increase customer engagement.



Send WhatsApp Text Messages
Send instant and direct WhatsApp text messages via the DoubleTick API for seamless customer communication within the last 24-hour session window. 🚀

Suggest Edits
API Endpoint
Use the following endpoint to send a text message:


POST https://public.doubletick.io/whatsapp/message/text
Request Headers
JSON

{
  "Authorization": "YOUR_API_KEY",
  "Content-Type": "application/json"
}
Request Body Parameters
JSON

{
  "to": "customer_number",
  "from": "sender_number",
  "messageId": "uuid-v4xxx",
  "content": {
    "text": "Hello, this is a sample message from DoubleTick!"
  }
}
Parameters
to (string, required): Customer’s phone number in international format.
from (string, required): Your registered sender phone number in international format.
messageId (string, optional):
Message ID (UUID v4) to be used for the message.
If not provided, a random UUID v4 will be generated automatically.
Length to be exact 36 characters.
content (object, required)
text (string, required): The text message content.
Responses
Success Response (201)
JSON

{
  "status": "SENT",
  "recipient": "customer_number",
  "messageId": "unique_message_id"
}
Bad Request (400)
JSON

{
  "message": "error_message",
  "error": "Bad Request",
  "statusCode": 400
}
Unauthorized (401)
JSON

{
  "message": "Invalid public api key",
  "error": "Unauthorized",
  "statusCode": 401
}
Unprocessable Entity (422)
JSON

{
  "message": "invalid file type for audio: text/html; charset=utf-8",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
Best Practices
If messaging outside the 24-hour window, use template messages instead.
Updated 10 months ago

