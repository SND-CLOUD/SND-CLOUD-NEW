const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const oldTransferUI = `                  {(() => {
                    const src = funds.find(f => f.id === transferSourceFundId);
                    const dest = funds.find(f => f.id === transferDestFundId);
                    if (src && dest && src.currency !== dest.currency) {
                      return (
                        <div className="flex flex-col gap-2 py-2 border-t border-white/5 mt-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[9px] text-gray-400 font-bold mb-1 font-cairo text-center">
                                صرف المصدر ({src.currency})
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                dir="ltr"
                                lang="en"
                                value={transferSourceRate}
                                onFocus={e => e.target.select()}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '');
                                  const parts = val.split('.');
                                  if (parts.length > 2) return;
                                  setTransferSourceRate(val);
                                }}
                                className="w-full h-9 bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-blue-500 text-center text-gray-300"
                                placeholder="1.00"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-gray-400 font-bold mb-1 font-cairo text-center">
                                صرف الوجهة ({dest.currency})
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                dir="ltr"
                                lang="en"
                                value={transferDestRate}
                                onFocus={e => e.target.select()}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '');
                                  const parts = val.split('.');
                                  if (parts.length > 2) return;
                                  setTransferDestRate(val);
                                }}
                                className="w-full h-9 bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-blue-500 text-center text-blue-400"
                                placeholder="1.00"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-blue-400 font-bold mb-1 font-cairo text-center">
                                المعادل بالوجهة
                              </label>
                              <div className="w-full h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-center font-mono text-xs font-black text-blue-300" dir="ltr">
                                {((parseFloat(transferDestRate) || 1) > 0 ? ((parseFloat(transferAmount) || 0) * ((parseFloat(transferSourceRate) || 1) / (parseFloat(transferDestRate) || 1))).toFixed(2) : '0.00')}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}`;

const newTransferUI = `                  <div className="flex flex-col gap-2 py-2 border-t border-white/5 mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold mb-1 font-cairo text-center">
                          صرف التحويل
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          dir="ltr"
                          lang="en"
                          value={(() => {
                            const src = funds.find(f => f.id === transferSourceFundId);
                            const dest = funds.find(f => f.id === transferDestFundId);
                            return (src && dest && src.currency === dest.currency) ? '1' : transferExchangeRate;
                          })()}
                          disabled={(() => {
                            const src = funds.find(f => f.id === transferSourceFundId);
                            const dest = funds.find(f => f.id === transferDestFundId);
                            return !src || !dest || src.currency === dest.currency;
                          })()}
                          onFocus={e => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = val.split('.');
                            if (parts.length > 2) return;
                            setTransferExchangeRate(val);
                          }}
                          className="w-full h-9 bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-blue-500 text-center text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="1.00"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-blue-400 font-bold mb-1 font-cairo text-center">
                          المعادل بالوجهة
                        </label>
                        <div className="w-full h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-center font-mono text-xs font-black text-blue-300" dir="ltr">
                          {(() => {
                            const src = funds.find(f => f.id === transferSourceFundId);
                            const dest = funds.find(f => f.id === transferDestFundId);
                            if (src && dest && src.currency === dest.currency) return (parseFloat(transferAmount) || 0).toFixed(2);
                            const rate = parseFloat(transferExchangeRate) || 1;
                            return rate > 0 ? ((parseFloat(transferAmount) || 0) / rate).toFixed(2) : '0.00';
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>`;

if (code.includes(oldTransferUI)) {
  code = code.replace(oldTransferUI, newTransferUI);
  fs.writeFileSync('src/components/Vault.tsx', code);
  console.log("Replaced transfer UI");
} else {
  console.log("Could not find old transfer UI block");
}
