const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const printNotesCode = `                          {/* 6. Notes */}
                          <div className="grid grid-cols-4">
                            <div className="col-span-1 bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300 text-gray-800">الشرح والبيان:</div>
                            <div className="col-span-3 px-4 py-2.5 text-gray-800 italic">
                              {voucherNotes || 'لا يوجد'}
                            </div>
                          </div>`;

const newPrintNotesCode = `                          {/* 6. Notes */}
                          <div className="grid grid-cols-4">
                            <div className="col-span-1 bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300 text-gray-800">الشرح والبيان:</div>
                            <div className="col-span-3 px-4 py-2.5 text-gray-900 font-semibold text-sm leading-relaxed">
                              {(() => {
                                const parsedAmount = parseFloat(voucherAmount) || 0;
                                let computed = parsedAmount;
                                if (liabilityCurrency && liabilityCurrency !== selectedCurrency) {
                                  const rate = parseFloat(voucherExchangeRate) || 1;
                                  computed = rate > 0 ? Math.round((parsedAmount / rate) * 100) / 100 : 0;
                                }
                                const statementKeyword = activeSegment === 'receipt' ? 'لكم' : 'عليكم';
                                const currencyNameText = currencies.find(c => c.name === liabilityCurrency)?.name || liabilityCurrency || '';
                                return \`\${voucherNotes.trim()} \${statementKeyword} مبلغ \${computed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} \${currencyNameText} مقابل \${selectedCategory}\`;
                              })()}
                            </div>
                          </div>`;

if (code.includes('الشرح والبيان:')) {
  code = code.replace(printNotesCode, newPrintNotesCode);
  fs.writeFileSync('src/components/Vault.tsx', code);
  console.log('Update print notes successful');
} else {
  console.log('Could not find print notes');
}
