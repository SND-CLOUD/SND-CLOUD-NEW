const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const fundPrintCode = `                          {/* 4. Fund Box */}
                          <div className="grid grid-cols-4">
                            <div className="col-span-1 bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300 text-gray-800">الصندوق المستلم:</div>
                            <div className="col-span-3 px-4 py-2.5 text-gray-900 font-semibold flex items-center gap-2">
                              <span>{funds.find(f => f.id === selectedFundId)?.name}</span>
                              <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-black">
                                {funds.find(f => f.id === selectedFundId)?.type === 'cash' ? 'نقدي' : 'حساب بنكي'}
                              </span>
                            </div>
                          </div>`;

const newFundPrintCode = `                          {/* 4. Fund Box */}
                          <div className="grid grid-cols-4">
                            <div className="col-span-1 bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300 text-gray-800">رقم الصندوق:</div>
                            <div className="col-span-3 px-4 py-2.5 text-gray-900 font-semibold flex items-center gap-2">
                              <span className="font-mono" dir="ltr">{funds.find(f => f.id === selectedFundId)?.id?.replace('fund-', '') || selectedFundId}</span>
                              <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-black">
                                {funds.find(f => f.id === selectedFundId)?.type === 'cash' ? 'نقدي' : 'حساب بنكي'}
                              </span>
                            </div>
                          </div>`;

code = code.replace(fundPrintCode, newFundPrintCode);
fs.writeFileSync('src/components/Vault.tsx', code);
