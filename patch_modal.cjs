const fs = require('fs');
let code = fs.readFileSync('src/components/AddCustomerModal.tsx', 'utf8');

// Insert addLiabilityCurrency state
code = code.replace(/const \[addCompanyName, setAddCompanyName\] = useState\(''\);/g, "const [addCompanyName, setAddCompanyName] = useState('');\n  const [addLiabilityCurrency, setAddLiabilityCurrency] = useState('USD');");

// Insert field into the grid
const emailField = `              <div className="space-y-2 text-right">
                <label className="text-[11px] font-bold text-gray-400 block font-cairo">البريد الإلكتروني (اختياري):</label>
                <input
                  type="email"
                  placeholder="customer@domain.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none transition-all text-sm font-bold text-white text-right font-mono"
                />
              </div>`;

const currencyField = `
              <div className="space-y-2 text-right">
                <label className="text-[11px] font-bold text-gray-400 block font-cairo">عملة الذمة الافتراضية:</label>
                <select
                  value={addLiabilityCurrency}
                  onChange={(e) => setAddLiabilityCurrency(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none transition-all text-sm font-bold text-white text-right font-cairo appearance-none"
                >
                  <option value="USD">دولار (USD)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="YER">ريال يمني (YER)</option>
                  <option value="EUR">يورو (EUR)</option>
                </select>
              </div>`;

code = code.replace(emailField, emailField + currencyField);

// Modify handleAddCustomer logic
code = code.replace(/companyName: addCompanyName.trim\(\),/g, "companyName: addCompanyName.trim(),\n        liabilityCurrency: addLiabilityCurrency,");

code = code.replace(/companyName: addCompanyName.trim\(\),/g, "companyName: addCompanyName.trim(),\n          liabilityCurrency: addLiabilityCurrency,"); // Check for sqlite branch

// Add reset
code = code.replace(/setAddCompanyName\(''\);/g, "setAddCompanyName('');\n      setAddLiabilityCurrency('USD');");

// Modify Customer autocomplete onSelect
code = code.replace(/setAddCompanyName\(c.companyName \|\| ''\);/g, "setAddCompanyName(c.companyName || '');\n                    setAddLiabilityCurrency(c.liabilityCurrency || 'USD');");

fs.writeFileSync('src/components/AddCustomerModal.tsx', code);
