sed -i '/{selectedDeviceForDetail.status !== .محظور. && (/i \
                          {/* Button 3: حذف الجهاز */}\n\
                          <button\n\
                            type="button"\n\
                            onClick={() => handleDeleteDevice(selectedDeviceForDetail.id)}\n\
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"\n\
                          >\n\
                            <Trash2 size={14} />\n\
                            <span>حذف الجهاز</span>\n\
                          </button>\n\
' src/components/AccountingInputs.tsx
