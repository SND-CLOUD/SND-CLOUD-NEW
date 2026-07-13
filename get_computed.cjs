const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const printCode = `                          {/* 2. Amount */}
                          <div className="grid grid-cols-4">
                            <div className="col-span-1 bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300 text-gray-800">المبلغ الإجمالي:</div>
                            <div className="col-span-3 px-4 py-2.5 font-black text-emerald-700 text-sm">
                              {parseFloat(voucherAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency}
                            </div>
                          </div>`;

const newPrintCode = `                          {/* 2. Amount */}
                          <div className="grid grid-cols-4">
                            <div className="col-span-1 bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300 text-gray-800">المبلغ الإجمالي:</div>
                            <div className="col-span-3 px-4 py-2.5 font-black text-emerald-700 text-sm">
                              {(() => {
                                const parsedAmount = parseFloat(voucherAmount) || 0;
                                let computed = parsedAmount;
                                if (liabilityCurrency && liabilityCurrency !== selectedCurrency) {
                                  const rate = parseFloat(voucherExchangeRate) || 1;
                                  computed = rate > 0 ? Math.round((parsedAmount / rate) * 100) / 100 : 0;
                                }
                                return computed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                              })()} {currencies.find(c => c.name === liabilityCurrency)?.name || liabilityCurrency || selectedCurrency}
                            </div>
                          </div>`;

code = code.replace(printCode, newPrintCode);
fs.writeFileSync('src/components/Vault.tsx', code);
