const fs = require('fs');
let data = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

data.entities.CompanyDetails.properties = {
  "id": { "type": "string" },
  "shopName": { "type": "string" },
  "countryCode": { "type": "string" },
  "phone1": { "type": "string" },
  "phone2": { "type": "string" },
  "landline": { "type": "string" },
  "phone1Call": { "type": "boolean" },
  "phone1Whatsapp": { "type": "boolean" },
  "phone2Call": { "type": "boolean" },
  "phone2Whatsapp": { "type": "boolean" },
  "landlineCall": { "type": "boolean" },
  "landlineWhatsapp": { "type": "boolean" },
  "facebookUrl": { "type": "string" },
  "mapUrl": { "type": "string" },
  "email": { "type": "string" },
  "bio": { "type": "string" },
  "logoUrl": { "type": "string" },
  "address": { "type": "string" },
  "bankYerName": { "type": "string" },
  "bankYerAccount": { "type": "string" },
  "bankSarName": { "type": "string" },
  "bankSarAccount": { "type": "string" },
  "bankUsdName": { "type": "string" },
  "bankUsdAccount": { "type": "string" },
  "bankHolderName": { "type": "string" },
  "fiscalYear": { "type": "string" },
  "startDate": { "type": "string" },
  "updatedAt": { "type": "string" }
};

fs.writeFileSync('firebase-blueprint.json', JSON.stringify(data, null, 2));
