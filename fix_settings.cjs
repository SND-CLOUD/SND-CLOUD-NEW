const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');
code = code.replace(
  "const updatedConfig = {\n                                    shopName: shopName.trim(),",
  "const updatedConfig = {\n                                    id: 'main_details',\n                                    shopName: shopName.trim(),"
);
code = code.replace(
  "startDate: new Date().toISOString().split('T')[0]\n                                  };",
  "startDate: new Date().toISOString().split('T')[0],\n                                    updatedAt: new Date().toISOString()\n                                  };"
);
code = code.replace(
  "await setDoc(doc(db, 'settings', 'shop'), updatedConfig, { merge: true });\n                                  localStorage.setItem('snd_country_code', updatedConfig.countryCode);",
  "await setDoc(doc(db, 'settings', 'shop'), updatedConfig, { merge: true });\n                                  await setDoc(doc(db, 'company_details', 'main_details'), updatedConfig, { merge: true });\n                                  localStorage.setItem('snd_country_code', updatedConfig.countryCode);"
);
fs.writeFileSync('src/components/Settings.tsx', code);
