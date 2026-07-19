const fs = require('fs');
let content = fs.readFileSync('src/components/DeviceManagement.tsx', 'utf8');

const badEndStr = `      setAdminNewPrice(0);
                                setSubview('admin_correction_action');
                              }}
                              className="px-4.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-800/10 hover:shadow-orange-700/20 whitespace-nowrap"
                            >
                              إجراء
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}`;

// We need to completely rewrite the end of handleAdminSaveDevice, and then the missing subviews.

const goodCode = `      setSubview('admin_correction');
    } catch (err: any) {
      handleFirestoreError(err, 'DeviceManagement');
    } finally {
      setAdminSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Cpu className="text-orange-500" size={28} />
            إدارة وحوكمة الأجهزة
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-bold">إدارة مسارات الفحص، الصيانة، التسليم، والإجراءات الإدارية المتقدمة</p>
        </div>
        {subview !== 'hub' && (
          <button
            onClick={() => setSubview('hub')}
            className="w-full md:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
          >
            <ArrowRight size={18} />
            العودة للقائمة الرئيسية
          </button>
        )}
      </div>

      {/* SUBVIEW: Hub */}
      {subview === 'hub' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => setSubview('active_devices')} className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-white/5 text-right hover:bg-white/5 transition-all group">
            <div className="bg-blue-500/10 text-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">الأجهزة النشطة</h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">إدارة أجهزة قيد الفحص والصيانة</p>
          </button>
          <button onClick={() => setSubview('ready_exit')} className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-white/5 text-right hover:bg-white/5 transition-all group">
            <div className="bg-emerald-500/10 text-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">أجهزة جاهزة للتسليم</h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">تسليم الأجهزة للعملاء وإنهاء الفواتير</p>
          </button>
          <button onClick={() => setSubview('delivered')} className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-white/5 text-right hover:bg-white/5 transition-all group">
            <div className="bg-purple-500/10 text-purple-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PackageCheck size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">الأجهزة المسلمة</h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">سجل الأجهزة التي تم تسليمها</p>
          </button>
          {hasPermission('settings_advanced_mgmt', 'edit') && (
            <button onClick={() => setSubview('admin_correction')} className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-white/5 text-right hover:bg-white/5 transition-all group">
              <div className="bg-orange-500/10 text-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-black text-white mb-2">إجراءات إدارية</h3>
              <p className="text-xs text-gray-400 font-bold leading-relaxed">تصحيح وتعديل حالات الأجهزة</p>
            </button>
          )}
        </div>
      )}

      {/* SUBVIEW: Active Devices */}
      {subview === 'active_devices' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-black text-white">الأجهزة النشطة</h3>
            <div className="grid grid-cols-1 gap-4">
              {activeInvoicesFiltered.map(inv => (
                <div key={inv.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-white font-mono">#{inv.invoiceNumber}</span>
                    <h4 className="text-md font-bold text-gray-300">{inv.customerName}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedInvoice(inv); setSubview('inspection_form'); }} className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-bold hover:bg-blue-500 hover:text-white transition-all">فحص</button>
                    <button onClick={() => { setSelectedInvoice(inv); setSubview('approval_form'); }} className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white transition-all">موافقة وقطع</button>
                    <button onClick={() => { setSelectedInvoice(inv); setSubview('maintenance_form'); }} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all">صيانة</button>
                  </div>
                </div>
              ))}
              {activeInvoicesFiltered.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-bold">لا توجد أجهزة نشطة حالياً</div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* SUBVIEW: Ready Exit */}
      {subview === 'ready_exit' && (
        <DeviceExit user={user} onBack={() => setSubview('hub')} shopConfig={shopConfig} />
      )}

      {/* SUBVIEW: Delivered */}
      {subview === 'delivered' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-black text-white">الأجهزة المسلمة</h3>
            <div className="grid grid-cols-1 gap-4">
              {deliveredInvoicesFiltered.map(inv => (
                <div key={inv.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-white font-mono">#{inv.invoiceNumber}</span>
                    <h4 className="text-md font-bold text-gray-300">{inv.customerName}</h4>
                  </div>
                  <button onClick={() => setActivePreviewInvoice(inv)} className="px-4 py-2 bg-white/5 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                    <Eye size={16} />
                    عرض التفاصيل
                  </button>
                </div>
              ))}
              {deliveredInvoicesFiltered.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-bold">لا توجد أجهزة مسلمة हालياً</div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* SUBVIEW: Forms */}
      {subview === 'inspection_form' && selectedInvoice && (
        <Inspection invoice={selectedInvoice} onBack={() => setSubview('active_devices')} user={user} />
      )}
      {subview === 'approval_form' && selectedInvoice && (
        <ApprovalAndParts invoice={selectedInvoice} onBack={() => setSubview('active_devices')} user={user} />
      )}
      {subview === 'maintenance_form' && selectedInvoice && (
        <Maintenance invoice={selectedInvoice} onBack={() => setSubview('active_devices')} user={user} />
      )}

      {/* SUBVIEW: Admin Correction List */}
      {subview === 'admin_correction' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 animate-fade-in"
        >
          <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-white/5 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">تصحيح وحوكمة الأجهزة</h3>
                <p className="text-xs text-gray-400 mt-1 font-bold">تعديل حالات الأجهزة استثنائياً من قبل الإدارة</p>
              </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-right text-sm font-cairo">
                <thead className="bg-black/40 text-gray-400 font-bold">
                  <tr>
                    <th className="p-4 whitespace-nowrap">رقم الفاتورة</th>
                    <th className="p-4 whitespace-nowrap">العميل</th>
                    <th className="p-4 whitespace-nowrap">الأجهزة</th>
                    <th className="p-4 whitespace-nowrap text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {getFilteredInvoices().map(inv => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono text-white font-bold">#{inv.invoiceNumber}</td>
                      <td className="p-4 font-bold text-rose-400">{inv.customerName}</td>
                      <td className="p-4 text-gray-400 font-mono">{getDevicesCount(inv.invoiceNumber)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedInvoiceForAdmin(inv);
                            setSelectedItemForEdit(null);
                            setAdminNewStatus('');
                            setAdminNewQuantity(1);
                            setAdminNewPrice(0);
                            setSubview('admin_correction_action');
                          }}
                          className="px-4.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-800/10 hover:shadow-orange-700/20 whitespace-nowrap"
                        >
                          إجراء
                        </button>
                      </td>
                    </tr>
                  ))}
                  {getFilteredInvoices().length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 font-bold">لا توجد نتائج</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
`;

const startIndex = content.indexOf("      setAdminNewPrice(0);\n                                setSubview('admin_correction_action');");

if (startIndex > -1) {
  content = content.substring(0, startIndex) + goodCode + "\n\n      {/* SUBVIEW: Admin Correction Item Action Form */}\n      {subview === 'admin_correction_action' && selectedInvoiceForAdmin && (";
  fs.writeFileSync('src/components/DeviceManagement.tsx', content);
  console.log("Restored successfully!");
} else {
  console.log("Could not find bad string.");
}
