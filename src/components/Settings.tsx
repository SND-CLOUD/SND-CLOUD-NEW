import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch, updateDoc, deleteDoc, addDoc, serverTimestamp } from '../firebase';
import { Save, RefreshCw, Smartphone, Database, Languages, LogOut, Shield, Fingerprint, Lock, Clock, HardDrive, Download, Archive, Upload, RotateCcw, FileText, User as UserIcon, Tag, X, Cpu, Calculator, ArrowLeft, ArrowRight, Edit, Phone, Mail, Facebook, MapPin, Store, ChevronLeft, Globe, Settings as SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
import { localDb } from '../lib/local-db';
import { User, ShopConfig } from '../types';
import SystemManagersList from './SystemManagersList';
import UserManagement from './UserManagement';
import EngineersTable from './EngineersTable';
import CategoriesTable from './CategoriesTable';
import DeviceManagement from './DeviceManagement';
import AccountingInputs from './AccountingInputs';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';
import { NativeBiometric } from 'capacitor-native-biometric';
import { exportBackupFile, restoreBackupData, archiveOldData } from '../lib/backup';
import { usePermissions } from '../hooks/usePermissions';

export default function Settings({ user, shopConfig, onShopConfigUpdate, onSignOut }: { user: User, shopConfig: ShopConfig | null, onShopConfigUpdate?: (config: any) => void, onSignOut?: () => void }) {
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermissions(user);

  const canShowCategory = (catId: string) => {
    if (catId === 'advanced-management') return user.name === 'المدير العام' || user.username === 'admin' || user.id === 'primary-admin';
    if (catId === 'management') return true;
    if (catId === 'general' || catId === 'security') return true;
    if (catId === 'accounting-inputs') return hasPermission('settings_main_data', 'view');
    if (catId === 'categories-engineers') return hasPermission('settings_devices_engineers', 'view');
    if (catId === 'device-management') return hasPermission('settings_device_management', 'view');
    if (catId === 'users') return true;
    return true;
  };
  
  const [invoiceCounter, setInvoiceCounter] = useState(0);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<{ active: boolean; value: number; label: string }>({ active: false, value: 0, label: '' });
  const [activeTab, setActiveTab ] = useState<'main' | 'general' | 'security' | 'backup' | 'users' | 'categories-engineers' | 'device-management' | 'accounting-inputs' | 'advanced-management' | 'management'>('main');
  const [backupSubTab, setBackupSubTab] = useState<'list' | 'stats' | 'backup_manual' | 'export' | 'import' | 'archive' | 'reset' | 'audit'>('list');
  const [advancedDbView, setAdvancedDbView] = useState<'list' | 'stats' | 'backup_manual' | 'export' | 'import' | 'archive' | 'reset' | 'audit'>('list');
  const [advancedTab, setAdvancedTab] = useState<'database' | 'devices' | 'general_manager' | 'system_reset' | 'confirm_system'>('database');
  const [managementTab, setManagementTab] = useState<'database_read' | 'backup' | 'devices'>('database_read');
  const [advancedDbSubTab, setAdvancedDbSubTab] = useState<'sync' | 'backup'>('sync');
  const [backupLoading, setBackupLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Shop details states
  const [activeCategoriesEngineersModal, setActiveCategoriesEngineersModal] = useState<'categories' | 'engineers' | null>(null);
  const [activeAccountingInputsModal, setActiveAccountingInputsModal] = useState<'accounting' | 'details' | 'backup' | null>(null);
  const [activeAdvancedModal, setActiveAdvancedModal] = useState<'database' | 'devices' | 'general_manager' | 'system_reset' | 'confirm_system' | null>(null);
  const [activeManagementModal, setActiveManagementModal] = useState<'database_read' | 'backup' | 'devices' | null>(null);

  const [generalSubTab, setGeneralSubTab] = useState<'language' | 'details' | 'advanced' | 'database'>('language');
  const [activeGeneralModal, setActiveGeneralModal] = useState<'language' | 'details' | 'advanced' | 'database' | null>(null);
  
  // Database configuration states
  const [dbMode, setDbMode] = useState<'LOCAL' | 'CLOUD' | 'AUTO'>('LOCAL');
  const [activeProvider, setActiveProvider] = useState<'LOCAL' | 'CLOUD'>('LOCAL');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [appearance, setAppearance] = useState<'normal' | 'dark'>('normal');
  const [printPaperSize, setPrintPaperSize] = useState<'A4' | '80mm'>('A4');
  const [shopName, setShopName] = useState('عالم الصيانة والتجارة');
  const [countryCode, setCountryCode] = useState('+967');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [landline, setLandline] = useState('');
  const [phone1Call, setPhone1Call] = useState(false);
  const [phone1Whatsapp, setPhone1Whatsapp] = useState(false);
  const [phone2Call, setPhone2Call] = useState(false);
  const [phone2Whatsapp, setPhone2Whatsapp] = useState(false);
  const [landlineCall, setLandlineCall] = useState(false);
  const [landlineWhatsapp, setLandlineWhatsapp] = useState(false);
  const [facebookUrl, setFacebookUrl] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [address, setAddress] = useState('');
  const [isEditingShop, setIsEditingShop] = useState(false);

  // Bank Accounts
  const [bankYerName, setBankYerName] = useState('');
  const [bankYerAccount, setBankYerAccount] = useState('');
  const [bankSarName, setBankSarName] = useState('');
  const [bankSarAccount, setBankSarAccount] = useState('');
  const [bankUsdName, setBankUsdName] = useState('');
  const [bankUsdAccount, setBankUsdAccount] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');

  // Audit States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<{
    lastChecked: Date | null;
    invoiceCounter: { registered: number; actualMax: number; conflict: boolean };
    customerCounter: { registered: number; actualMax: number; conflict: boolean };
    totalDiscrepancies: any[];
    statusDiscrepancies: any[];
    paymentImbalances: any[];
    orphanedItems: any[];
    emptyInvoices: any[];
  } | null>(null);
  const [repairProgress, setRepairProgress] = useState<{
    status: 'idle' | 'running' | 'completed' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // Security States
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');

  // Backup States
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupTime, setBackupTime] = useState('00:00');
  const [backupPath, setBackupPath] = useState('Documents/SND_Backups');
  const [backupCount, setBackupCount] = useState(0);

  const [statsData, setStatsData] = useState({
    invoices: 0,
    customers: 0,
    maintenance: 0,
    support: 0
  });

  const refreshStats = async () => {
    try {
      const { ProviderFactory } = await import('../data/ProviderFactory');
      const provider = ProviderFactory.getProvider();
      
      const invoicesSnap = await provider.getDocs('invoices');
      const customersSnap = await provider.getDocs('customers');
      const maintenanceSnap = await provider.getDocs('maintenance_actions');
      
      setStatsData({
        invoices: invoicesSnap.docs?.length || 0,
        customers: customersSnap.docs?.length || 0,
        maintenance: maintenanceSnap.docs?.length || 0,
        support: 0
      });
    } catch (e) {
      console.error('Error fetching statistics:', e);
    }
  };

  useEffect(() => {
    (window as any).isSettingsDeepView = activeTab !== 'main' || activeGeneralModal !== null || activeCategoriesEngineersModal !== null || activeAccountingInputsModal !== null || activeAdvancedModal !== null || activeManagementModal !== null;
    const handleCloseDeepView = () => {
      if (activeGeneralModal !== null) {
        setActiveGeneralModal(null);
      } else if (activeCategoriesEngineersModal !== null) {
        setActiveCategoriesEngineersModal(null);
      } else if (activeAccountingInputsModal !== null) {
        setActiveAccountingInputsModal(null);
      } else if (activeAdvancedModal !== null) { setActiveAdvancedModal(null); } else if (activeManagementModal !== null) { setActiveManagementModal(null); } else {
        setActiveTab('main');
      }
    };
    window.addEventListener('closeSettingsDeepView', handleCloseDeepView);
    return () => {
      (window as any).isSettingsDeepView = false;
      window.removeEventListener('closeSettingsDeepView', handleCloseDeepView);
    };
  }, [activeTab, activeGeneralModal, activeCategoriesEngineersModal, activeAccountingInputsModal]);

  useEffect(() => {
    const fetch = async () => {
      const s = await getDoc(doc(db, 'settings', 'app'));
      const data = s.data();
      setInvoiceCounter(data?.lastInvoiceNumber || 0);
      
      const localSettings = JSON.parse(localStorage.getItem('snd_settings') || '{}');
      setBiometricEnabled(localSettings.biometricEnabled || false);
      setPinEnabled(localSettings.pinEnabled || false);
      setPinCode(localSettings.pinCode || '');
      setAutoBackup(localSettings.autoBackup || false);
      setBackupTime(localSettings.backupTime || '00:00');
      setBackupPath(localSettings.backupPath || 'Documents/SND_Backups');
      setAppearance(localSettings.appearance || 'normal');
      setPrintPaperSize(localSettings.printPaperSize || 'A4');

      await refreshStats();

      try {
        const localDetails = await localDb.query("SELECT * FROM company_details LIMIT 1");
        if (localDetails.values && localDetails.values.length > 0) {
          const detail = localDetails.values[0];
          setShopName(detail.shopName || 'عالم الصيانة والتجارة');
          setCountryCode(detail.countryCode || '+967');
          setPhone1(detail.phone1 || '');
          setPhone2(detail.phone2 || '');
          setLandline(detail.landline || '');
          setPhone1Call(detail.phone1Call === 1);
          setPhone1Whatsapp(detail.phone1Whatsapp === 1);
          setPhone2Call(detail.phone2Call === 1);
          setPhone2Whatsapp(detail.phone2Whatsapp === 1);
          setLandlineCall(detail.landlineCall === 1);
          setLandlineWhatsapp(detail.landlineWhatsapp === 1);
          setFacebookUrl(detail.facebookUrl || '');
          setMapUrl(detail.mapUrl || '');
          setEmail(detail.email || '');
          setBio(detail.bio || '');
          setLogoUrl(detail.logoUrl || '');
          setAddress(detail.address || '');
          setBankYerName(detail.bankYerName || '');
          setBankYerAccount(detail.bankYerAccount || '');
          setBankSarName(detail.bankSarName || '');
          setBankSarAccount(detail.bankSarAccount || '');
          setBankUsdName(detail.bankUsdName || '');
          setBankUsdAccount(detail.bankUsdAccount || '');
          setBankHolderName(detail.bankHolderName || '');
        }
      } catch (localErr) {
        console.warn("Failed to fetch local company details from SQLite:", localErr);
      }

      try {
        const shopSnap = await getDoc(doc(db, 'settings', 'shop'));
        if (shopSnap.exists()) {
          const shopData = shopSnap.data();
          setShopName(shopData.shopName || 'عالم الصيانة والتجارة');
          setCountryCode(shopData.countryCode || '+967');
          localStorage.setItem('snd_country_code', shopData.countryCode || '+967');
          setPhone1(shopData.phone1 || '');
          setPhone2(shopData.phone2 || '');
          setLandline(shopData.landline || '');
          setPhone1Call(shopData.phone1Call ?? false);
          setPhone1Whatsapp(shopData.phone1Whatsapp ?? false);
          setPhone2Call(shopData.phone2Call ?? false);
          setPhone2Whatsapp(shopData.phone2Whatsapp ?? false);
          setLandlineCall(shopData.landlineCall ?? false);
          setLandlineWhatsapp(shopData.landlineWhatsapp ?? false);
          setFacebookUrl(shopData.facebookUrl || '');
          setMapUrl(shopData.mapUrl || '');
          setEmail(shopData.email || '');
          setBio(shopData.bio || '');
          setLogoUrl(shopData.logoUrl || '');
          setAddress(shopData.address || '');
          setBankYerName(shopData.bankYerName || '');
          setBankYerAccount(shopData.bankYerAccount || '');
          setBankSarName(shopData.bankSarName || '');
          setBankSarAccount(shopData.bankSarAccount || '');
          setBankUsdName(shopData.bankUsdName || '');
          setBankUsdAccount(shopData.bankUsdAccount || '');
          setBankHolderName(shopData.bankHolderName || '');

          // Save/Sync to local SQLite table "company_details" as well
          try {
            await localDb.run(
              `INSERT OR REPLACE INTO company_details (
                id, shopName, countryCode, phone1, phone2, landline, 
                phone1Call, phone1Whatsapp, phone2Call, phone2Whatsapp, 
                landlineCall, landlineWhatsapp, facebookUrl, mapUrl, 
                email, bio, logoUrl, address, updatedAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                'main_details',
                shopData.shopName || 'عالم الصيانة والتجارة',
                shopData.countryCode || '+967',
                shopData.phone1 || '',
                shopData.phone2 || '',
                shopData.landline || '',
                shopData.phone1Call ? 1 : 0,
                shopData.phone1Whatsapp ? 1 : 0,
                shopData.phone2Call ? 1 : 0,
                shopData.phone2Whatsapp ? 1 : 0,
                shopData.landlineCall ? 1 : 0,
                shopData.landlineWhatsapp ? 1 : 0,
                shopData.facebookUrl || '',
                shopData.mapUrl || '',
                shopData.email || '',
                shopData.bio || '',
                shopData.logoUrl || '',
                shopData.address || '',
                new Date().toISOString()
              ]
            );
          } catch (syncErr) {
            console.error("Failed to sync Firebase shop settings to local SQLite:", syncErr);
          }
        }
      } catch (shopErr) {
        console.warn("Failed to fetch shop settings from Firebase:", shopErr);
      }

      try {
        const { ProviderFactory } = await import('../data/ProviderFactory');
        setDbMode(ProviderFactory.getMode());
        setActiveProvider(ProviderFactory.getActiveProviderType());
      } catch (dbErr) {
        console.warn("Failed to load database provider factory settings:", dbErr);
      }
    };
    fetch();
    refreshBackupCount();
  }, []);

  const refreshBackupCount = async () => {
    try {
      const info = await Device.getInfo();
      if (info.platform !== 'web') {
        const result = await Filesystem.readdir({
          path: backupPath,
          directory: Directory.Documents,
        });
        setBackupCount(result.files.length);
      } else {
        setBackupCount(0);
      }
    } catch (e) {
      setBackupCount(0);
    }
  };

  const handleSaveDbMode = async (mode: 'LOCAL' | 'CLOUD' | 'AUTO') => {
    setDbMode(mode);
    try {
      const { ProviderFactory } = await import('../data/ProviderFactory');
      ProviderFactory.setMode(mode);
    } catch (err) {
      console.error("Failed to save database mode:", err);
    }
  };

  const handleSyncNow = async () => {
    setSyncLoading(true);
    setSyncResult({ type: null, message: '' });
    try {
      const { SyncEngine } = await import('../data/SyncEngine');
      const res = await SyncEngine.syncAll();
      if (res.success) {
        setSyncResult({ type: 'success', message: res.message });
        await refreshStats();
      } else {
        setSyncResult({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setSyncResult({ type: 'error', message: err.message || 'حدث خطأ غير متوقع أثناء المزامنة.' });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleExportBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await exportBackupFile();
      alert(res.message);
    } catch (e: any) {
      alert('خطأ أثناء التصدير: ' + e.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في هذا الملف. هل أنت متأكد من المتابعة؟')) {
      e.target.value = '';
      return;
    }

    setBackupLoading(true);
    try {
      const text = await file.text();
      await restoreBackupData(text);
      alert('تم استعادة النسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة.');
      window.location.reload();
    } catch (err: any) {
      alert('فشل الاستعادة: ملف غير صالح أو تالف.');
    } finally {
      setBackupLoading(false);
      e.target.value = '';
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('تحذير: سيتم مسح الفواتير المسلمة والمرتجعة التي مضى عليها أكثر من 12 شهر بشكل نهائي من قاعدة البيانات. هل تريد المتابعة؟')) return;
    
    setBackupLoading(true);
    try {
      const res = await archiveOldData(12); // archive older than 12 months
      alert(res.message);
    } catch (err: any) {
      alert('فشل في عملية الأرشفة: ' + err.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const runDatabaseAudit = async () => {
    setIsAuditing(true);
    setRepairProgress({ status: 'idle', message: '' });
    try {
      const invoicesRes = await localDb.query('SELECT * FROM invoices');
      const dbInvoices = invoicesRes.values || [];
      
      const itemsRes = await localDb.query('SELECT * FROM invoice_items');
      const dbItems = itemsRes.values || [];
      
      const txRes = await localDb.query('SELECT * FROM vault_transactions');
      const dbTransactions = txRes.values || [];
      
      const customersRes = await localDb.query('SELECT * FROM customers');
      const dbCustomers = customersRes.values || [];

      const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
      const settingsData = settingsDoc.data();
      const registeredLastInvoice = Number(settingsData?.lastInvoiceNumber) || 0;
      const registeredLastCustomer = Number(settingsData?.lastCustomerNumber) || 0;

      let maxInvoiceNum = 0;
      dbInvoices.forEach((inv: any) => {
        const num = parseInt(inv.invoiceNumber, 10);
        if (!isNaN(num) && num > maxInvoiceNum) {
          maxInvoiceNum = num;
        }
      });

      let maxCustomerNum = 0;
      dbCustomers.forEach((cust: any) => {
        const num = parseInt(cust.customerNumber, 10);
        if (!isNaN(num) && num > maxCustomerNum) {
          maxCustomerNum = num;
        }
      });

      const invoiceCounterConflict = registeredLastInvoice < maxInvoiceNum;
      const customerCounterConflict = registeredLastCustomer < maxCustomerNum;

      const totalDiscrepancies: any[] = [];
      const statusDiscrepancies: any[] = [];
      const invoiceItemGroups: Record<string, any[]> = {};

      dbItems.forEach((item: any) => {
        if (!invoiceItemGroups[item.invoiceId]) {
          invoiceItemGroups[item.invoiceId] = [];
        }
        invoiceItemGroups[item.invoiceId].push(item);
      });

      dbInvoices.forEach((inv: any) => {
        const items = invoiceItemGroups[inv.id] || [];
        const computedTotal = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

        if (Math.abs(computedTotal - Number(inv.totalCost)) > 0.01) {
          totalDiscrepancies.push({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            currentTotal: inv.totalCost,
            computedTotal
          });
        }

        let hasPending = false;
        let hasReady = false;
        let hasDelivered = false;

        items.forEach((item: any) => {
          if (['new', 'testing', 'repairing', '10', '20', '30', '35', '40'].includes(item.status)) hasPending = true;
          else if (['ready', 'intact', 'unrepairable', 'refused', '50'].includes(item.status)) hasReady = true;
          else if (['delivered', '60'].includes(item.status)) hasDelivered = true;
        });

        let expectedStatus = inv.status;
        if (items.length > 0) {
          if (!hasPending && !hasReady && hasDelivered) {
            expectedStatus = inv.status === 'delivered' ? 'delivered' : '60';
          } else if (hasReady || hasDelivered) {
            expectedStatus = inv.status === 'ready' ? 'ready' : '50';
          } else {
            expectedStatus = inv.status === 'new' ? 'new' : '10';
          }
        }

        if (inv.status !== expectedStatus) {
          statusDiscrepancies.push({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            currentStatus: inv.status,
            expectedStatus
          });
        }
      });

      const paymentImbalances: any[] = [];
      const txGroupsByInvoiceNum: Record<string, any[]> = {};
      dbTransactions.forEach((tx: any) => {
        if (tx.type === 'income' && tx.invoiceNumber) {
          const invNum = String(tx.invoiceNumber).trim();
          if (!txGroupsByInvoiceNum[invNum]) {
            txGroupsByInvoiceNum[invNum] = [];
          }
          txGroupsByInvoiceNum[invNum].push(tx);
        }
      });

      dbInvoices.forEach((inv: any) => {
        const txs = txGroupsByInvoiceNum[String(inv.invoiceNumber).trim()] || [];
        const computedPaid = txs.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        if (Math.abs(computedPaid - Number(inv.amountPaid)) > 0.01) {
          paymentImbalances.push({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            currency: inv.currency,
            amountPaidOnInvoice: inv.amountPaid,
            amountInLedger: computedPaid,
            status: inv.status,
            totalCost: inv.totalCost
          });
        }
      });

      const orphanedItems: any[] = [];
      const invoiceIdsSet = new Set(dbInvoices.map((inv: any) => inv.id));
      dbItems.forEach((item: any) => {
        if (!invoiceIdsSet.has(item.invoiceId)) {
          orphanedItems.push(item);
        }
      });

      const emptyInvoices: any[] = [];
      dbInvoices.forEach((inv: any) => {
        if (!invoiceItemGroups[inv.id] || invoiceItemGroups[inv.id].length === 0) {
          emptyInvoices.push(inv);
        }
      });

      setAuditResults({
        lastChecked: new Date(),
        invoiceCounter: {
          registered: registeredLastInvoice,
          actualMax: maxInvoiceNum,
          conflict: invoiceCounterConflict
        },
        customerCounter: {
          registered: registeredLastCustomer,
          actualMax: maxCustomerNum,
          conflict: customerCounterConflict
        },
        totalDiscrepancies,
        statusDiscrepancies,
        paymentImbalances,
        orphanedItems,
        emptyInvoices
      });
    } catch (e: any) {
      console.error('Audit calculations failed:', e);
    } finally {
      setIsAuditing(false);
    }
  };

  const repairAllDiscrepancies = async () => {
    if (!auditResults) return;
    setRepairProgress({ status: 'running', message: 'جاري تسوية البيانات وتحديث قواعد الفحص التلقائي...' });
    try {
      let step = 1;
      const totalSteps = 6;

      if (auditResults.invoiceCounter.conflict) {
        setRepairProgress({ status: 'running', message: `[${step}/${totalSteps}] جاري ترفيع عدّاد الفواتير التلقائي ليكون ${auditResults.invoiceCounter.actualMax}...` });
        await setDoc(doc(db, 'settings', 'app'), { lastInvoiceNumber: auditResults.invoiceCounter.actualMax }, { merge: true });
        setInvoiceCounter(auditResults.invoiceCounter.actualMax);
      }
      step++;

      if (auditResults.customerCounter.conflict) {
        setRepairProgress({ status: 'running', message: `[${step}/${totalSteps}] جاري تصحيح عدّاد هوية العملاء ليكون ${auditResults.customerCounter.actualMax}...` });
        await setDoc(doc(db, 'settings', 'app'), { lastCustomerNumber: auditResults.customerCounter.actualMax }, { merge: true });
      }
      step++;

      if (auditResults.totalDiscrepancies.length > 0) {
        setRepairProgress({ status: 'running', message: `[${step}/${totalSteps}] إعادة احتساب مجاميع لـ ${auditResults.totalDiscrepancies.length} فواتير...` });
        for (const item of auditResults.totalDiscrepancies) {
          await updateDoc(doc(db, 'invoices', item.id), { totalCost: item.computedTotal });
        }
      }
      step++;

      if (auditResults.statusDiscrepancies.length > 0) {
        setRepairProgress({ status: 'running', message: `[${step}/${totalSteps}] مزامنة الحالة الفنية لـ ${auditResults.statusDiscrepancies.length} فواتير...` });
        for (const item of auditResults.statusDiscrepancies) {
          await updateDoc(doc(db, 'invoices', item.id), { status: item.expectedStatus });
        }
      }
      step++;

      if (auditResults.paymentImbalances.length > 0) {
        setRepairProgress({ status: 'running', message: `[${step}/${totalSteps}] موازنة وتسجيل المعاملات المالية المفقودة لـ ${auditResults.paymentImbalances.length} حالة...` });
        for (const item of auditResults.paymentImbalances) {
          if (item.amountInLedger === 0 && item.amountPaidOnInvoice > 0) {
            const txId = `tx_audit_${item.invoiceNumber}_${Math.random().toString(36).substring(2, 6)}`;
            await addDoc(collection(db, 'vault_transactions'), {
              id: txId,
              currency: item.currency,
              amount: Number(item.amountPaidOnInvoice),
              customerName: item.customerName || 'عميل نقدي',
              invoiceNumber: String(item.invoiceNumber),
              userName: user.name || 'المدير العام',
              userNumber: 1,
              userId: user.id || 'primary-admin',
              timestamp: serverTimestamp(),
              type: 'income',
              notes: `قيد تسوية لمطابقة المدفوع بالفاتورة #${item.invoiceNumber}`
            });
          } else if (item.amountInLedger > 0 && item.amountPaidOnInvoice !== item.amountInLedger) {
            let newStatus = item.status;
            if (item.amountInLedger >= item.totalCost) {
              newStatus = 'delivered';
            }
            await updateDoc(doc(db, 'invoices', item.id), { 
              amountPaid: item.amountInLedger,
              status: newStatus
            });
          }
        }
      }
      step++;

      if (auditResults.orphanedItems.length > 0) {
        setRepairProgress({ status: 'running', message: `[${step}/${totalSteps}] حذف وإزالة ${auditResults.orphanedItems.length} قطعة غيار يتيمة...` });
        for (const item of auditResults.orphanedItems) {
          await deleteDoc(doc(db, 'invoice_items', item.id));
        }
      }
      step++;

      setRepairProgress({ status: 'completed', message: 'تم التحديث وتسوية قاعدة الاختلافات بنجاح! جميع أرقام العدادات والمعاملات تتوافق 100% مع سجلات خادم Firebase.' });
      await runDatabaseAudit();
      await refreshStats();
    } catch (e: any) {
      console.error('Auto repair failed:', e);
      setRepairProgress({ status: 'error', message: `حدث خطأ أثناء الإصلاح: ${e.message || e}` });
    }
  };

  const handleSaveSettings = async () => {
    const settings = {
      biometricEnabled,
      pinEnabled,
      pinCode,
      autoBackup,
      backupTime,
      backupPath,
      appearance,
      printPaperSize
    };
    localStorage.setItem('snd_settings', JSON.stringify(settings));

    // Update biometric credentials secure storage
    try {
      const info = await Device.getInfo();
      if (biometricEnabled) {
        if (info.platform === 'web') {
          localStorage.setItem('snd_bio_credentials', JSON.stringify({
            username: user.username,
            password: user.password
          }));
          localStorage.setItem('snd_has_bio_credentials', 'true');
        } else {
          await NativeBiometric.setCredentials({
            username: user.username,
            password: user.password,
            server: 'com.snd.maintenance'
          });
          localStorage.setItem('snd_has_bio_credentials', 'true');
        }
      } else {
        if (info.platform === 'web') {
          localStorage.removeItem('snd_bio_credentials');
          localStorage.removeItem('snd_has_bio_credentials');
        } else {
          try {
            await NativeBiometric.deleteCredentials({
              server: 'com.snd.maintenance'
            });
          } catch (e) {}
          localStorage.removeItem('snd_has_bio_credentials');
        }
      }
    } catch (err) {
      console.warn("Could not sync biometric credentials in Settings:", err);
    }

    setDoc(doc(db, 'settings', 'app'), { appSettings: settings }, { merge: true });
    alert(t('settings.saved'));
    window.dispatchEvent(new Event('snd_settings_changed'));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'app'), { lastInvoiceNumber: Number(invoiceCounter) }, { merge: true });
      alert(t('settings.saved'));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      sessionStorage.removeItem('snd_user');
      window.location.reload();
    }
  };

  const resetAllDataTemp = async (bypassConfirm = false) => {
    console.log('ResetAllDataTemp started executing', { bypassConfirm });
    if (!bypassConfirm) {
      setShowResetConfirm(true);
      return;
    }

    try {
      setSaving(true);
      console.log('Starting factory reset process...');
      setProgress({ active: true, value: 10, label: 'جاري تهيئة النظام...' });

      // 1. Clear Firestore collections (with safety wrap)
      try {
        const collectionsToClear = [
          'invoices', 'invoice_items', 'customers', 'maintenance_actions', 
          'approval_actions', 'vault_transactions', 
          'inventory_items', 'document_outputs'
        ];
        
        let colIdx = 0;
        for (const colName of collectionsToClear) {
          colIdx++;
          const percent = Math.round(10 + (colIdx / collectionsToClear.length) * 35);
          setProgress({ active: true, value: percent, label: `جاري تهيئة السحاب: ${colName}...` });
          const snap = await getDocs(collection(db, colName));
          for (const docSnap of snap.docs) {
            await deleteDoc(docSnap.ref).catch(e => console.warn(`Error deleting doc ${docSnap.id}:`, e));
          }
        }

        // Clear all users in Firestore and reset only one primary admin user to prevent duplication
        setProgress({ active: true, value: 45, label: 'جاري تهيئة حسابات المستخدمين في السحاب...' });
        const usersSnap = await getDocs(collection(db, 'users'));
        for (const docSnap of usersSnap.docs) {
          if (docSnap.id === 'primary-admin') {
            await setDoc(docSnap.ref, {
              id: 'primary-admin',
              username: 'admin',
              password: 'admin',
              name: 'المدير العام',
              role: 'admin',
              isPrimary: true,
              userNumber: 100,
              isActive: true
            });
          } else {
            // Delete all other users, including any duplicate admin entries with other IDs
            await deleteDoc(docSnap.ref).catch(e => console.warn(`Error deleting user doc ${docSnap.id}:`, e));
          }
        }
        // Ensure that the 'primary-admin' doc is always present
        await setDoc(doc(db, 'users', 'primary-admin'), {
          id: 'primary-admin',
          username: 'admin',
          password: 'admin',
          name: 'المدير العام',
          role: 'admin',
          isPrimary: true,
          userNumber: 100,
          isActive: true
        });
      } catch (fsErr) {
        console.warn('Firestore reset failed/skipped (offline or permission issue):', fsErr);
      }

      // 2. Clear Local SQLite
      setProgress({ active: true, value: 50, label: 'جاري تنظيف قاعدة البيانات المحلية...' });
      const tablesToClear = [
        'invoices', 'invoice_items', 'customers', 'maintenance_actions', 
        'approval_actions', 'vault_transactions', 
        'inventory_items', 'document_outputs'
      ];
      
      let tableIdx = 0;
      for (const table of tablesToClear) {
        tableIdx++;
        const percent = Math.round(50 + (tableIdx / tablesToClear.length) * 35);
        setProgress({ active: true, value: percent, label: `جاري تنظيف جدول: ${table}...` });
        try {
          await localDb.run(`DELETE FROM ${table}`);
        } catch (e) {
          console.error(`Error clearing table ${table}`, e);
        }
      }

      // Clear all users in SQLite and insert exactly one primary admin
      try {
        await localDb.run(`DELETE FROM users`);
        await localDb.run(`INSERT INTO users (id, username, password, name, role, isPrimary, userNumber, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['primary-admin', 'admin', 'admin', 'المدير العام', 'admin', 1, 100, 1]);
      } catch (e) {
        console.error(`Error resetting users in SQLite`, e);
      }

      // Reset funds balances
      try {
        await localDb.run(`UPDATE fin_funds SET balance = 0`);
      } catch (e) {
        console.error('Error resetting funds balances', e);
      }
      
      // 3. Reset Counter settings in Firestore (with safety wrap)
      try {
        await setDoc(doc(db, 'settings', 'app'), { 
          lastInvoiceNumber: 0, 
          lastCustomerNumber: 0
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Failed to reset app settings in Firestore:', fsErr);
      }

      // 4. Clear LocalStorage settings
      // localStorage.removeItem('snd_settings'); // Keep shop details and settings intact
      // localStorage.removeItem('snd_country_code'); // Keep country code intact
      localStorage.removeItem('snd_has_bio_credentials');
      localStorage.removeItem('snd_bio_credentials');
      localStorage.setItem('snd_db_seeded', 'true');
      sessionStorage.removeItem('alertsClosed');
      sessionStorage.removeItem('snd_user');

      setProgress({ active: false, value: 100, label: 'تم الحذف بنجاح!' });
      setSaving(false);
      
      // Show custom success status modal
      setResetStatus({ type: 'success', message: 'تمت تهيئة النظام وتصفير كافة البيانات بنجاح! سيتم إعادة تشغيل التطبيق تلقائياً بعد ثانيتين لإتمام العملية...' });
      setTimeout(() => {
        window.location.reload();
      }, 2500);
      
    } catch (e: any) {
        console.error('Error during resetAllDataTemp:', e);
        setSaving(false);
        setProgress({ active: false, value: 0, label: '' });
        setResetStatus({ type: 'error', message: 'حدث خطأ غير متوقع أثناء تهيئة النظام: ' + (e.message || e) });
    }
  };



  const categories = [
    { id: 'general', title: t('settings.general'), icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'advanced-management', title: 'إدارة متقدمة', icon: SettingsIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'management', title: 'إدارة', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'accounting-inputs', title: 'مدخلات البيانات الرئيسية', icon: Calculator, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'categories-engineers', title: 'تصنيفات الأجهزة والمهندسين', icon: Cpu, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'users', title: t('settings.users'), icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'security', title: t('settings.security'), icon: Shield, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 h-full overflow-y-auto pb-20 sm:pb-8">
      {/* Progress Overlay */}
      {progress.active && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 w-full max-w-sm text-center shadow-2xl">
            <h3 className="text-white font-bold mb-4">{progress.label}</h3>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-blue-500"
                 initial={{ width: 0 }}
                 animate={{ width: `${progress.value}%` }}
               />
            </div>
            <p className="text-gray-500 text-xs mt-2">{Math.round(progress.value)}%</p>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          !canShowCategory(cat.id) ? null : (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setActiveTab(cat.id as any)}
              className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-[1.25rem] border border-white/5 hover:border-white/10 transition-all text-left rtl:text-right group shadow-lg"
            >
              <div className={`p-2.5 ${cat.bg} ${cat.color} rounded-xl group-hover:scale-105 transition-transform`}>
                <cat.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-white">{cat.title}</h3>
                <p className="text-[9px] text-gray-500 mt-0.5">إعدادات القسم وتحكم متقدم</p>
              </div>
              <div className="text-gray-600 group-hover:text-white transition-colors text-sm">
                 {i18n.language === 'ar' ? '←' : '→'}
              </div>
            </motion.button>
          )
        ))}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleSignOut}
          className="col-span-full mt-2 flex items-center justify-center p-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-[1.5rem] border border-red-500/20 transition-all font-bold shadow-lg group"
          title={t('common.signOut')}
        >
          <LogOut size={24} className="group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>

      {/* Independent Window / Modal Overlay */}
      <AnimatePresence>
        {activeTab !== 'main' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-8 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121212] w-full max-w-4xl h-screen sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-[2rem] border-0 sm:border sm:border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Unified Header */}
              <div className="flex items-center px-4 py-3 border-b border-white/10 bg-[#121212]/80 backdrop-blur-xl z-20 sticky top-0" dir="rtl">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab('main')}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                  >
                    <ArrowRight size={18} />
                  </button>
                  <div>
                    <h1 className="text-lg font-black text-white m-0 p-0">
                      {activeTab === 'general' && t('settings.general')}
                      {activeTab === 'accounting-inputs' && 'مدخلات البيانات الرئيسية'}
                      {activeTab === 'security' && t('settings.security')}
                      {activeTab === 'users' && t('settings.users')}
                      {activeTab === 'categories-engineers' && 'تصنيفات الأجهزة والمهندسين'}
                      {activeTab === 'device-management' && 'إدارة الأجهزة'}
                      {activeTab === 'advanced-management' && 'إدارة متقدمة'}
                      {activeTab === 'management' && 'إدارة'}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Modal Content - Fixed, No Scroll */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 pb-28 sm:pb-8">
                {!canShowCategory(activeTab) ? (
                  <div className="text-center py-12 text-gray-400 font-cairo" dir="rtl">
                    <p className="text-lg font-bold">عذراً، ليس لديك صلاحية للوصول إلى هذا القسم.</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'general' && (
                  <div className="space-y-6 pb-8 text-right font-cairo" dir="rtl">
                    {/* Vertical list of general settings options */}
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">
                      {/* 1. Language Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setGeneralSubTab('language');
                          setActiveGeneralModal('language');
                        }}
                        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Languages size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">اللغة والتحديث</h3>
                            <p className="text-xs text-gray-400 mt-1">تعديل لغة واجهة النظام وتحديث الإعدادات العامة</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      {/* 2. Advanced Settings Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setGeneralSubTab('advanced');
                          setActiveGeneralModal('advanced');
                        }}
                        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <SettingsIcon size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">ضبط متقدم</h3>
                            <p className="text-xs text-gray-400 mt-1">تخصيص المظهر العام للنظام وإعدادات الطباعة الافتراضية</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                    </div>

                    {/* Modals for general settings options */}
                    <AnimatePresence>
                      {activeGeneralModal !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#181818] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl p-6 sm:p-8 w-full max-w-4xl h-full sm:h-[85vh] shadow-2xl relative overflow-y-auto flex flex-col text-right font-cairo"
                            dir="rtl"
                          >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                              <h3 className="text-lg font-black text-white flex items-center gap-2">
                                {activeGeneralModal === 'language' && <Languages className="text-orange-500" size={20} />}
                                {activeGeneralModal === 'advanced' && <SettingsIcon className="text-orange-500" size={20} />}
                                {activeGeneralModal === 'database' && <Database className="text-orange-500" size={20} />}
                                {activeGeneralModal === 'language' && 'اللغة والتحديث'}
                                {activeGeneralModal === 'advanced' && 'ضبط إعدادات متقدمة والمظهر'}
                                {activeGeneralModal === 'database' && 'إعدادات قاعدة البيانات والمزامنة المتقدمة'}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setActiveGeneralModal(null)}
                                className="p-2.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all border border-white/5 cursor-pointer"
                                title="خروج / إغلاق"
                              >
                                <X size={20} />
                              </button>
                            </div>

                            {/* Modal Content container */}
                            <div className="flex-1 overflow-y-auto pr-1">
                              {activeGeneralModal === 'language' && (
                      <section className="space-y-6 animate-in fade-in duration-200">
                         <div className="p-5 md:p-6 bg-white/5 rounded-[1.5rem] sm:rounded-3xl border border-white/5 space-y-4">
                            <div className="flex items-center justify-between rtl:flex-row-reverse">
                               <h3 className="font-bold text-white text-lg">{t('settings.language')}</h3>
                               <button 
                                 onClick={handleSave}
                                 disabled={saving}
                                 className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg"
                               >
                                 {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                 {t('settings.update')}
                               </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <button 
                                 onClick={() => i18n.changeLanguage('en')}
                                 className={`py-6 rounded-2.5xl border-2 font-bold transition-all ${i18n.language.startsWith('en') ? 'bg-orange-600/10 border-orange-600 text-orange-500 shadow-xl' : 'bg-black/20 border-white/5 text-gray-500 hover:text-white'}`}
                               >
                                 English
                               </button>
                               <button 
                                 onClick={() => i18n.changeLanguage('ar')}
                                 className={`py-6 rounded-2.5xl border-2 font-bold transition-all ${i18n.language.startsWith('ar') ? 'bg-orange-600/10 border-orange-600 text-orange-500 shadow-xl' : 'bg-black/20 border-white/5 text-gray-500 hover:text-white'}`}
                               >
                                 <span className="font-arabic">العربية</span>
                               </button>
                            </div>
                         </div>
                      </section>
                    )}
                    {activeGeneralModal === 'advanced' && (
                      <div className="space-y-6 animate-in fade-in duration-200 text-right">
                        {/* Header Box */}
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-white text-lg">ضبط إعدادات متقدمة</h3>
                            <p className="text-xs text-gray-500 mt-1">تخصيص المظهر العام للنظام وإعدادات الطباعة الافتراضية</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleSaveSettings}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
                          >
                            <Save size={16} />
                            حفظ الإعدادات المتقدمة
                          </button>
                        </div>

                        {/* Form elements inside Card */}
                        <div className="p-5 md:p-8 bg-white/5 rounded-[1.5rem] sm:rounded-3xl border border-white/5 space-y-6">
                          
                          {/* Row 1: المظهر العام */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-white/5">
                            <div>
                               <span className="font-bold text-white text-base">المظهر العام</span>
                               <p className="text-xs text-gray-500 mt-0.5">اختر المظهر المفضل لواجهة المستخدم للنظام</p>
                            </div>
                            <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-center">
                               <button
                                 type="button"
                                 onClick={() => setAppearance('normal')}
                                 className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${appearance === 'normal' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                               >
                                 عادي (مضيء)
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setAppearance('dark')}
                                 className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${appearance === 'dark' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                               >
                                 مظلم (ليلي)
                               </button>
                            </div>
                          </div>

                          {/* Row 2: إعداد الطباعة */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 font-cairo">
                            <div>
                               <span className="font-bold text-white text-base">إعداد الطباعة والورق</span>
                               <p className="text-xs text-gray-500 mt-0.5">تحديد مقاس الورق الافتراضي عند طباعة الفواتير والسندات</p>
                            </div>
                            <div className="flex gap-2">
                               <select
                                 value={printPaperSize}
                                 onChange={(e) => setPrintPaperSize(e.target.value as 'A4' | '80mm')}
                                 className="bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-500/50 appearance-none text-right font-bold pl-8"
                               >
                                  <option value="A4" className="bg-[#1c1c1c]">صفحة كاملة (عريض A4)</option>
                                  <option value="80mm" className="bg-[#1c1c1c]">ورق حراري (لفافة 80mm)</option>
                               </select>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                    {activeGeneralModal === 'database' && (
                      <div className="space-y-6 animate-in fade-in duration-200 text-right font-cairo">
                        {/* Header Box */}
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-white text-lg">مصدر البيانات وقاعدة البيانات</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              اختر ما إذا كان التطبيق يستخدم قاعدة بيانات محلية، أو قاعدة بيانات سحابية (Firebase)، أو وضعاً تلقائياً وهجيناً يقوم بالتحويل تلقائياً عند انقطاع الإنترنت.
                            </p>
                          </div>
                        </div>

                        {/* Mode selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            type="button"
                            onClick={() => handleSaveDbMode('LOCAL')}
                            className={`p-6 rounded-3xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${dbMode === 'LOCAL' ? 'bg-orange-600/10 border-orange-600 text-orange-500 shadow-xl' : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:border-white/10'}`}
                          >
                            <HardDrive size={28} />
                            <div className="text-center">
                              <span className="block font-bold text-sm">إصدار محلي (LOCAL)</span>
                              <span className="text-[10px] text-gray-500 block mt-1">تشغيل البيانات محلياً على الهاتف/المتصفح عبر SQLite</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveDbMode('CLOUD')}
                            className={`p-6 rounded-3xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${dbMode === 'CLOUD' ? 'bg-orange-600/10 border-orange-600 text-orange-500 shadow-xl' : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:border-white/10'}`}
                          >
                            <Globe size={28} />
                            <div className="text-center">
                              <span className="block font-bold text-sm">إصدار سحابي (CLOUD)</span>
                              <span className="text-[10px] text-gray-500 block mt-1">تخزين البيانات مباشرة على السحابة (Firebase Firestore)</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveDbMode('AUTO')}
                            className={`p-6 rounded-3xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${dbMode === 'AUTO' ? 'bg-orange-600/10 border-orange-600 text-orange-500 shadow-xl' : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:border-white/10'}`}
                          >
                            <Cpu size={28} />
                            <div className="text-center">
                              <span className="block font-bold text-sm">وضع تلقائي وهجين (AUTO)</span>
                              <span className="text-[10px] text-gray-500 block mt-1">استخدام السحابة عند توفر الإنترنت، والتبديل للمحلي عند انقطاعه</span>
                            </div>
                          </button>
                        </div>

                        {/* Status Card */}
                        <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                          <h4 className="font-bold text-white text-sm">الحالة والتشخيص الفعلي</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-black/30 rounded-2xl border border-white/5 flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-orange-600/10 text-orange-500">
                                <HardDrive size={18} />
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 block">مصدر البيانات النشط حالياً</span>
                                <span className="text-sm font-bold text-white">
                                  {activeProvider === 'CLOUD' ? 'السحابة (Firebase)' : 'قاعدة البيانات المحلية (SQLite)'}
                                </span>
                              </div>
                            </div>

                            <div className="p-4 bg-black/30 rounded-2xl border border-white/5 flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-orange-600/10 text-orange-500">
                                <Globe size={18} />
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 block">حالة اتصال الشبكة</span>
                                <span className={`text-sm font-bold ${navigator.onLine ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {navigator.onLine ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sync Card */}
                        <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-white text-sm">مزامنة البيانات السحابية والمحلية</h4>
                              <p className="text-[10px] text-gray-500 mt-1">تزامن السجلات بين قاعدة البيانات المحلية والسحابة (ثنائي الاتجاه)</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleSyncNow}
                              disabled={syncLoading}
                              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-center"
                            >
                              {syncLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                              مزامنة الآن
                            </button>
                          </div>

                          {syncResult.type && (
                            <div className={`p-4 rounded-xl text-xs font-bold border ${syncResult.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                              {syncResult.message}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8 pb-8">
                     <section className="bg-white/5 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <div className="p-5 md:p-8 border-b border-white/5 flex items-center justify-between rtl:flex-row-reverse">
                           <div className="flex items-center gap-3 rtl:flex-row-reverse">
                             <Shield className="text-orange-500" size={24} />
                             <h2 className="font-bold text-xl text-white">{t('settings.security')}</h2>
                           </div>
                           <button 
                             onClick={handleSaveSettings}
                             className="bg-orange-600 hover:bg-orange-700 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xl"
                           >
                             <Save size={18} /> {t('settings.update')}
                           </button>
                        </div>
                        <div className="p-5 md:p-8 space-y-8 rtl:text-right">
                           <div className="flex items-center justify-between p-5 md:p-6 bg-black/40 rounded-[1.5rem] sm:rounded-[2rem] border border-white/5">
                             <div className="flex items-center gap-4">
                               <div className="p-4 bg-orange-600/10 text-orange-500 rounded-2xl"><Fingerprint size={32}/></div>
                               <div>
                                 <p className="font-black text-white text-lg">{t('settings.biometricLock')}</p>
                                 <p className="text-xs text-gray-500">تسجيل دخول آمن بواسطة البصمة أو الوجه</p>
                                 <DeviceSupportWarning type="biometric" />
                               </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer scale-125 mx-4">
                               <input 
                                 type="checkbox" 
                                 checked={biometricEnabled} 
                                 onChange={async (e) => {
                                   const checked = e.target.checked;
                                   if (checked) {
                                     const info = await Device.getInfo();
                                     if (info.platform === 'web') {
                                       alert('البصمة غير مدعومة في متصفح الويب. يرجى استخدام PIN بدلاً من ذلك.');
                                       return;
                                     }
                                     const bio = await NativeBiometric.isAvailable();
                                     if (!bio.isAvailable) {
                                       alert('جهازك لا يدعم التحقق البيومتري أو لم يتم إعداده.');
                                       return;
                                     }
                                   }
                                   setBiometricEnabled(checked);
                                 }} 
                                 className="sr-only peer" 
                               />
                               <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                             </label>
                           </div>

                           <div className="space-y-6">
                             <div className="flex items-center justify-between p-6 bg-black/40 rounded-[2rem] border border-white/5">
                               <div className="flex items-center gap-4">
                                 <div className="p-4 bg-orange-600/10 text-orange-500 rounded-2xl"><Lock size={32}/></div>
                                 <div>
                                   <p className="font-black text-white text-lg">{t('settings.pinLock')}</p>
                                   <p className="text-xs text-gray-500">قفل التطبيق برمز حماية (PIN) خاص</p>
                                 </div>
                               </div>
                               <label className="relative inline-flex items-center cursor-pointer scale-125 mx-4">
                                 <input type="checkbox" checked={pinEnabled} onChange={(e) => setPinEnabled(e.target.checked)} className="sr-only peer" />
                                 <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                               </label>
                             </div>
                             
                             {pinEnabled && (
                               <motion.div 
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: 'auto', opacity: 1 }}
                                 className="p-5 md:p-8 bg-black/60 rounded-[1.5rem] sm:rounded-[2.5rem] border border-orange-500/30 text-center space-y-6"
                               >
                                 <label className="text-xs text-orange-500 font-black uppercase tracking-widest">تحديد الرمز السري الجديد</label>
                                 <div className="max-w-[240px] mx-auto">
                                   <input 
                                     type="password" 
                                     maxLength={4}
                                     value={pinCode}
                                     onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                                     placeholder="****"
                                     className="w-full bg-black border-2 border-white/10 rounded-2xl px-6 py-5 text-center text-5xl tracking-[0.4em] focus:border-orange-500 outline-none text-white font-mono shadow-2xl"
                                   />
                                 </div>
                                 <p className="text-[10px] text-gray-500">سيتم طلب هذا الرمز عند فتح التطبيق</p>
                               </motion.div>
                             )}
                           </div>
                        </div>
                     </section>
                  </div>
                )}

                {activeTab === 'users' && activeTab !== 'main' && (
                  <div className="pb-8">
                    <UserManagement currentUser={user} />
                  </div>
                )}

                {activeTab === 'categories-engineers' && (
                  <div className="space-y-6 pb-8 text-right font-cairo" dir="rtl">
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">
                      {/* 1. Engineers Option */}
                      <button
                        type="button"
                        onClick={() => setActiveCategoriesEngineersModal('engineers')}
                        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer mx-4 md:mx-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <UserIcon size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">إدارة المهندسين والفنيين</h3>
                            <p className="text-xs text-gray-400 mt-1">إضافة، تعديل، أو حذف بيانات المهندسين والفنيين</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      {/* 2. Categories Option */}
                      <button
                        type="button"
                        onClick={() => setActiveCategoriesEngineersModal('categories')}
                        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer mx-4 md:mx-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Tag size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">تصنيفات الأجهزة</h3>
                            <p className="text-xs text-gray-400 mt-1">إدارة أنواع وموديلات الأجهزة للصيانة</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>
                    </div>

                    {/* Modals for categories-engineers options */}
                    <AnimatePresence>
                      {activeCategoriesEngineersModal !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a1a] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-[2rem] border border-white/10 shadow-2xl flex flex-col p-4 md:p-6 overflow-hidden"
                            dir="rtl"
                          >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
                              <h3 className="text-lg font-black text-white flex items-center gap-2">
                                {activeCategoriesEngineersModal === 'engineers' && <UserIcon className="text-emerald-500" size={20} />}
                                {activeCategoriesEngineersModal === 'categories' && <Tag className="text-emerald-500" size={20} />}
                                {activeCategoriesEngineersModal === 'engineers' && 'إدارة المهندسين والفنيين'}
                                {activeCategoriesEngineersModal === 'categories' && 'تصنيفات الأجهزة'}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setActiveCategoriesEngineersModal(null)}
                                className="p-2.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all border border-white/5 cursor-pointer"
                              >
                                <X size={20} />
                              </button>
                            </div>

                            {/* Modal Content container */}
                            <div className="flex-1 overflow-y-auto pr-1">
                              {activeCategoriesEngineersModal === 'engineers' && (
                                <div className="animate-in fade-in duration-200 h-full">
                                  <EngineersTable />
                                </div>
                              )}
                              {activeCategoriesEngineersModal === 'categories' && (
                                <div className="animate-in fade-in duration-200 h-full">
                                  <CategoriesTable />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeTab === 'device-management' && (
                   <DeviceManagement user={user} onBack={() => setActiveTab('main')} shopConfig={shopConfig} />
                )}

                {activeTab === 'accounting-inputs' && (
                  <div className="space-y-6 pb-8 text-right font-cairo" dir="rtl">
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">
                      {/* 1. Accounting Inputs Option */}
                      <button
                        type="button"
                        onClick={() => setActiveAccountingInputsModal('accounting')}
                        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer mx-4 md:mx-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-600/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <Calculator size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">مدخلات العمليات الحسابية</h3>
                            <p className="text-xs text-gray-400 mt-1">تحديد العملات، طرق الدفع وتصنيفات الحركات</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      {/* 2. Shop Details Option */}
                      <button
                        type="button"
                        onClick={() => setActiveAccountingInputsModal('details')}
                        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer mx-4 md:mx-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-600/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <Store size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">تفاصيل ومعلومات المحل</h3>
                            <p className="text-xs text-gray-400 mt-1">تحديد مسمى وعنوان المحل، أرقام التواصل وروابط التواصل الاجتماعي</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                    </div>

                    {/* Modals for accounting-inputs options */}
                    <AnimatePresence>
                      {activeAccountingInputsModal !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a1a] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-[2rem] border border-white/10 shadow-2xl flex flex-col p-4 md:p-6 overflow-hidden"
                            dir="rtl"
                          >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
                              <h3 className="text-lg font-black text-white flex items-center gap-2">
                                {activeAccountingInputsModal === 'accounting' && <Calculator className="text-amber-500" size={20} />}
                                {activeAccountingInputsModal === 'details' && <Store className="text-amber-500" size={20} />}
                                {activeAccountingInputsModal === 'backup' && <Database className="text-amber-500" size={20} />}
                                {activeAccountingInputsModal === 'accounting' && 'مدخلات العمليات الحسابية'}
                                {activeAccountingInputsModal === 'details' && 'تفاصيل ومعلومات المحل'}
                                {activeAccountingInputsModal === 'backup' && t('settings.maintenance')}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setActiveAccountingInputsModal(null)}
                                className="p-2.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all border border-white/5 cursor-pointer"
                              >
                                <X size={20} />
                              </button>
                            </div>

                            {/* Modal Content container */}
                            <div className="flex-1 overflow-y-auto pr-1">
                              {activeAccountingInputsModal === 'accounting' && (
                                <div className="animate-in fade-in duration-200 h-full">
                                  <AccountingInputs />
                                </div>
                              )}
                    {activeAccountingInputsModal === 'details' && (
                      <div className="space-y-6 animate-in fade-in duration-200 text-right">
                        {/* Header with Edit Action */}
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-white text-lg">تفاصيل ومعلومات المحل</h3>
                            <p className="text-xs text-gray-500 mt-1">تعديل معلومات المحل، طريقة التواصل والشعار العام للمطبوعات</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingShop(!isEditingShop);
                            }}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${isEditingShop ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'}`}
                          >
                            <Edit size={14} />
                            {isEditingShop ? 'إلغاء التعديل' : 'تحرير والبدء بالاعداد'}
                          </button>
                        </div>

                        {/* Details Editable Form */}
                        <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                          {/* Main Row / Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Shop Name - COMPULSORY */}
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold text-gray-400 block">اسم المحل (إجباري) <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <Store className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                  type="text"
                                  required
                                  disabled={!isEditingShop}
                                  value={shopName}
                                  onChange={(e) => setShopName(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl pr-12 pl-4 py-3.5 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                  placeholder="عالم الصيانة والتجارة"
                                />
                              </div>
                            </div>

                            {/* Country Code Selection */}
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold text-gray-400 block">رمز الدولة الافتراضي (لإرسال الواتساب)</label>
                              <div className="relative">
                                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <select
                                  disabled={!isEditingShop}
                                  value={countryCode}
                                  onChange={(e) => setCountryCode(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl pr-12 pl-4 py-3.5 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                                >
                                  <option value="+967">اليمن (+967)</option>
                                  <option value="+966">السعودية (+966)</option>
                                  <option value="+971">الإمارات (+971)</option>
                                  <option value="+965">الكويت (+965)</option>
                                  <option value="+974">قطر (+974)</option>
                                  <option value="+968">عمان (+968)</option>
                                  <option value="+973">البحرين (+973)</option>
                                  <option value="+962">الأردن (+962)</option>
                                  <option value="+963">سوريا (+963)</option>
                                  <option value="+964">العراق (+964)</option>
                                  <option value="+961">لبنان (+961)</option>
                                  <option value="+20">مصر (+20)</option>
                                  <option value="+218">ليبيا (+218)</option>
                                  <option value="+216">تونس (+216)</option>
                                  <option value="+212">المغرب (+212)</option>
                                  <option value="+249">السودان (+249)</option>
                                  <option value="+213">الجزائر (+213)</option>
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                  <ChevronLeft size={16} className="-rotate-90" />
                                </div>
                              </div>
                              <p className="text-[10px] text-gray-500 mr-2 italic">سيتم إضافة هذا الرمز تلقائياً لأي رقم هاتف لا يبدأ برمز دولي عند الإرسال.</p>
                            </div>

                            {/* Main Phone Number */}
                            <div className="space-y-4 p-4 bg-black/25 rounded-2xl border border-white/5">
                              <label className="text-xs font-bold text-gray-400 block">رقم جوال رئيسي</label>
                              <div className="relative">
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                  type="tel"
                                  disabled={!isEditingShop}
                                  value={phone1}
                                  onChange={(e) => setPhone1(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl pr-12 pl-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                  placeholder="مثال: 0500000000"
                                />
                              </div>
                              {/* Option Services for Phone 1 */}
                              <div className="flex gap-4 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                                  <input
                                    type="checkbox"
                                    disabled={!isEditingShop}
                                    checked={phone1Call}
                                    onChange={(e) => setPhone1Call(e.target.checked)}
                                    className="rounded border-white/10 text-orange-500 focus:ring-orange-500 bg-black/40 w-4 h-4"
                                  />
                                  <span>رمز اتصال</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                                  <input
                                    type="checkbox"
                                    disabled={!isEditingShop}
                                    checked={phone1Whatsapp}
                                    onChange={(e) => setPhone1Whatsapp(e.target.checked)}
                                    className="rounded border-white/10 text-orange-500 focus:ring-orange-500 bg-black/40 w-4 h-4"
                                  />
                                  <span>رمز واتساب</span>
                                </label>
                              </div>
                            </div>

                            {/* Secondary Phone Number */}
                            <div className="space-y-4 p-4 bg-black/25 rounded-2xl border border-white/5">
                              <label className="text-xs font-bold text-gray-400 block">رقم جوال ثانوي</label>
                              <div className="relative">
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                  type="tel"
                                  disabled={!isEditingShop}
                                  value={phone2}
                                  onChange={(e) => setPhone2(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl pr-12 pl-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                  placeholder="رقم هاتف جوال آخر"
                                />
                              </div>
                              {/* Option Services for Phone 2 */}
                              <div className="flex gap-4 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                                  <input
                                    type="checkbox"
                                    disabled={!isEditingShop}
                                    checked={phone2Call}
                                    onChange={(e) => setPhone2Call(e.target.checked)}
                                    className="rounded border-white/10 text-orange-500 focus:ring-orange-500 bg-black/40 w-4 h-4"
                                  />
                                  <span>رمز اتصال</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                                  <input
                                    type="checkbox"
                                    disabled={!isEditingShop}
                                    checked={phone2Whatsapp}
                                    onChange={(e) => setPhone2Whatsapp(e.target.checked)}
                                    className="rounded border-white/10 text-orange-500 focus:ring-orange-500 bg-black/40 w-4 h-4"
                                  />
                                  <span>رمز واتساب</span>
                                </label>
                              </div>
                            </div>

                            {/* Landline Phone Number */}
                            <div className="space-y-4 p-4 bg-black/25 rounded-2xl border border-white/5">
                              <label className="text-xs font-bold text-gray-400 block">رقم التلفون الأرضي</label>
                              <div className="relative">
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                  type="tel"
                                  disabled={!isEditingShop}
                                  value={landline}
                                  onChange={(e) => setLandline(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl pr-12 pl-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                  placeholder="مثال: 0110000000"
                                />
                              </div>
                              {/* Option Services for Landline */}
                              <div className="flex gap-4 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                                  <input
                                    type="checkbox"
                                    disabled={!isEditingShop}
                                    checked={landlineCall}
                                    onChange={(e) => setLandlineCall(e.target.checked)}
                                    className="rounded border-white/10 text-orange-500 focus:ring-orange-500 bg-black/40 w-4 h-4"
                                  />
                                  <span>رمز اتصال</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                                  <input
                                    type="checkbox"
                                    disabled={!isEditingShop}
                                    checked={landlineWhatsapp}
                                    onChange={(e) => setLandlineWhatsapp(e.target.checked)}
                                    className="rounded border-white/10 text-orange-500 focus:ring-orange-500 bg-black/40 w-4 h-4"
                                  />
                                  <span>رمز واتساب</span>
                                </label>
                              </div>
                            </div>

                            {/* Email Address */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 block">البريد الإلكتروني</label>
                              <div className="relative">
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                  type="email"
                                  disabled={!isEditingShop}
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl pr-12 pl-4 py-3.5 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                  placeholder="example@domain.com"
                                />
                              </div>
                            </div>

                            {/* Facebook page */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 block">صفحة فيسبوك</label>
                              <div className="relative">
                                <Facebook className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                  type="text"
                                  disabled={!isEditingShop}
                                  value={facebookUrl}
                                  onChange={(e) => setFacebookUrl(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl pr-12 pl-4 py-3.5 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                  placeholder="https://facebook.com/yourpage"
                                />
                              </div>
                            </div>

                            {/* Map Location */}
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold text-gray-400 block">الموقع على الخريطة</label>
                              <div className="relative">
                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                  type="text"
                                  disabled={!isEditingShop}
                                  value={mapUrl}
                                  onChange={(e) => setMapUrl(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl pr-12 pl-4 py-3.5 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                  placeholder="أو رابط خرائط قوقل مابز"
                                />
                              </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold text-gray-400 block">العنوان بالتفصيل</label>
                              <div className="relative">
                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                  type="text"
                                  disabled={!isEditingShop}
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl pr-12 pl-4 py-3.5 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                  placeholder="مثال: صنعاء - شارع حده - عمارة البركة الدور الأول"
                                />
                              </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-2 md:col-span-2 text-center flex flex-col items-center">
                              <label className="text-xs font-bold text-gray-400 w-full text-right block mb-1">شعار المحل للمطبوعات والتقارير</label>
                              <div className={`relative group mt-2 ${!isEditingShop ? 'opacity-80' : ''}`}>
                                <div className="w-36 h-36 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-orange-500">
                                  {logoUrl ? (
                                    <img src={logoUrl} alt="الشعار" className="w-full h-full object-contain p-2" />
                                  ) : (
                                    <Upload className="text-gray-600" size={32} />
                                  )}
                                </div>
                                {isEditingShop && (
                                  <>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            setLogoUrl(reader.result as string);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="absolute -bottom-2 -right-2 p-2 bg-orange-600 rounded-lg shadow-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Upload size={16} />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Bank Accounts */}
                            <div className="md:col-span-2 mt-4">
                              <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">الحسابات البنكية (تظهر في الفواتير - اختياري)</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* YER Bank */}
                                <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">YER</div>
                                    <span className="text-sm font-bold text-gray-300">حساب بنكي ريال</span>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 block">اسم الحساب</label>
                                    <input
                                      type="text"
                                      disabled={!isEditingShop}
                                      value={bankYerName}
                                      onChange={(e) => setBankYerName(e.target.value)}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-50 text-sm"
                                      placeholder="مثال: بنك الكريمي - ريال"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 block">رقم الحساب</label>
                                    <input
                                      type="tel"
                                      inputMode="tel"
                                      disabled={!isEditingShop}
                                      value={bankYerAccount}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9\- ]/g, '');
                                        setBankYerAccount(val);
                                      }}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-50 text-sm font-mono text-left"
                                      placeholder="XXX-XXXX-XXXX"
                                      dir="ltr"
                                    />
                                  </div>
                                </div>

                                {/* SAR Bank */}
                                <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">SAR</div>
                                    <span className="text-sm font-bold text-gray-300">حساب بنكي سعودي</span>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 block">اسم الحساب</label>
                                    <input
                                      type="text"
                                      disabled={!isEditingShop}
                                      value={bankSarName}
                                      onChange={(e) => setBankSarName(e.target.value)}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-50 text-sm"
                                      placeholder="مثال: بنك الكريمي - سعودي"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 block">رقم الحساب</label>
                                    <input
                                      type="tel"
                                      inputMode="tel"
                                      disabled={!isEditingShop}
                                      value={bankSarAccount}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9\- ]/g, '');
                                        setBankSarAccount(val);
                                      }}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-50 text-sm font-mono text-left"
                                      placeholder="XXX-XXXX-XXXX"
                                      dir="ltr"
                                    />
                                  </div>
                                </div>

                                {/* USD Bank */}
                                <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold text-xs">USD</div>
                                    <span className="text-sm font-bold text-gray-300">حساب بنكي دولار</span>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 block">اسم الحساب</label>
                                    <input
                                      type="text"
                                      disabled={!isEditingShop}
                                      value={bankUsdName}
                                      onChange={(e) => setBankUsdName(e.target.value)}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-50 text-sm"
                                      placeholder="مثال: بنك الكريمي - دولار"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 block">رقم الحساب</label>
                                    <input
                                      type="tel"
                                      inputMode="tel"
                                      disabled={!isEditingShop}
                                      value={bankUsdAccount}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9\- ]/g, '');
                                        setBankUsdAccount(val);
                                      }}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-50 text-sm font-mono text-left"
                                      placeholder="XXX-XXXX-XXXX"
                                      dir="ltr"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-6 space-y-2">
                                <label className="text-xs font-bold text-gray-400 block">اسم صاحب الحسابات البنكية (يظهر بداية سطر الحسابات في الفاتورة)</label>
                                <input
                                  type="text"
                                  disabled={!isEditingShop}
                                  value={bankHolderName}
                                  onChange={(e) => setBankHolderName(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-50 text-sm"
                                  placeholder="اسم صاحب الحساب (مثال: مؤسسة عالم الصيانة)"
                                />
                              </div>
                            </div>

                            {/* Description / Summary of Services */}
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold text-gray-400 block">نبذة مختصرة عن المحل وما الخدمات التي يقدمها</label>
                              <textarea
                                disabled={!isEditingShop}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-orange-500 outline-none transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed resize-none text-sm leading-relaxed"
                                placeholder="محل متخصص في الصيانة وبيع التجارة العامة وقطع الغيار..."
                              />
                            </div>

                          </div>

                          {/* Submit Action Block */}
                          <div className="border-t border-white/5 pt-6 flex justify-end">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!shopName.trim()) {
                                  alert("اسم المحل إجباري!");
                                  return;
                                }
                                setSaving(true);
                                try {
                                  const updatedConfig = {
                                    shopName: shopName.trim(),
                                    countryCode: countryCode.trim(),
                                    phone1: phone1.trim(),
                                    phone2: phone2.trim(),
                                    landline: landline.trim(),
                                    phone1Call,
                                    phone1Whatsapp,
                                    phone2Call,
                                    phone2Whatsapp,
                                    landlineCall,
                                    landlineWhatsapp,
                                    facebookUrl: facebookUrl.trim(),
                                    mapUrl: mapUrl.trim(),
                                    email: email.trim(),
                                    bio: bio.trim(),
                                    logoUrl,
                                    address: address.trim(),
                                    bankYerName: bankYerName.trim(),
                                    bankYerAccount: bankYerAccount.trim(),
                                    bankSarName: bankSarName.trim(),
                                    bankSarAccount: bankSarAccount.trim(),
                                    bankUsdName: bankUsdName.trim(),
                                    bankUsdAccount: bankUsdAccount.trim(),
                                    bankHolderName: bankHolderName.trim(),
                                    fiscalYear: new Date().getFullYear().toString(),
                                    startDate: new Date().toISOString().split('T')[0]
                                  };

                                  await setDoc(doc(db, 'settings', 'shop'), updatedConfig, { merge: true });
                                  localStorage.setItem('snd_country_code', updatedConfig.countryCode);

                                  // Save/Sync to local SQLite table "company_details" as well
                                  try {
                                    await localDb.run(
                                      `INSERT OR REPLACE INTO company_details (
                                        id, shopName, countryCode, phone1, phone2, landline, 
                                        phone1Call, phone1Whatsapp, phone2Call, phone2Whatsapp, 
                                        landlineCall, landlineWhatsapp, facebookUrl, mapUrl, 
                                        email, bio, logoUrl, address, updatedAt,
                                        bankYerName, bankYerAccount, bankSarName, bankSarAccount, bankUsdName, bankUsdAccount, bankHolderName
                                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                      [
                                        'main_details',
                                        updatedConfig.shopName,
                                        updatedConfig.countryCode,
                                        updatedConfig.phone1,
                                        updatedConfig.phone2,
                                        updatedConfig.landline,
                                        updatedConfig.phone1Call ? 1 : 0,
                                        updatedConfig.phone1Whatsapp ? 1 : 0,
                                        updatedConfig.phone2Call ? 1 : 0,
                                        updatedConfig.phone2Whatsapp ? 1 : 0,
                                        updatedConfig.landlineCall ? 1 : 0,
                                        updatedConfig.landlineWhatsapp ? 1 : 0,
                                        updatedConfig.facebookUrl,
                                        updatedConfig.mapUrl,
                                        updatedConfig.email,
                                        updatedConfig.bio,
                                        updatedConfig.logoUrl,
                                        updatedConfig.address,
                                        new Date().toISOString(),
                                        updatedConfig.bankYerName,
                                        updatedConfig.bankYerAccount,
                                        updatedConfig.bankSarName,
                                        updatedConfig.bankSarAccount,
                                        updatedConfig.bankUsdName,
                                        updatedConfig.bankUsdAccount,
                                        updatedConfig.bankHolderName
                                      ]
                                    );
                                  } catch (sqliteErr) {
                                    console.error("Failed to save to SQLite company_details table:", sqliteErr);
                                  }

                                  if (onShopConfigUpdate) {
                                    onShopConfigUpdate(updatedConfig);
                                  }
                                  setIsEditingShop(false);
                                  alert("تم حفظ تفاصيل ومعلومات المحل بنجاح!");
                                } catch (e: any) {
                                  console.error(e);
                                  alert("خطأ أثناء حفظ تفاصيل المحل: " + e.message);
                                } finally {
                                  setSaving(false);
                                }
                              }}
                              disabled={!isEditingShop || saving}
                              className={`px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl transition-all ${
                                !isEditingShop 
                                  ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed opacity-50' 
                                  : 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer active:scale-[0.98]'
                              }`}
                            >
                              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                              حفظ المعلومات
                            </button>
                          </div>

                        </div>
                      </div>
                    )}
                {activeAccountingInputsModal === 'backup' && (
                  <div className="space-y-3 pb-4">
                    {backupSubTab === 'list' ? (
                      <div className="space-y-2">
                        {/* Stats Block */}
                        <motion.button
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setBackupSubTab('stats')}
                          className="w-full bg-white/5 text-white p-3.5 rounded-[1.2rem] border border-white/10 flex items-center gap-3 shadow-xl relative group overflow-hidden"
                        >
                          <div className="flex-1 rtl:text-right">
                             <h3 className="text-base font-bold font-cairo">إحصائيات وقاعدة البيانات</h3>
                             <div className="mt-1 space-y-0.5">
                                <div className="flex items-center justify-end gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                   <span>{statsData.invoices + statsData.customers + statsData.maintenance}</span>
                                   <span>:إجمالي السجلات</span>
                                   <RefreshCw size={8} className="text-gray-500" />
                                </div>
                                <div className="flex items-center justify-end gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                   <span>{((statsData.invoices + statsData.customers + statsData.maintenance) * 0.012).toFixed(3)} MB</span>
                                   <span>:الحجم الكلي</span>
                                   <RefreshCw size={8} className="text-gray-500" />
                                </div>
                             </div>
                          </div>
                          <div className="p-2.5 bg-blue-600/10 text-blue-500 rounded-xl">
                             <Database size={22} />
                          </div>
                        </motion.button>

                        {/* Audit & Repair Block */}
                        <motion.button
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => {
                            setBackupSubTab('audit');
                            runDatabaseAudit();
                          }}
                          className="w-full bg-orange-600/10 text-orange-500 p-3.5 rounded-[1.2rem] border border-orange-500/20 flex items-center gap-3 shadow-xl relative group overflow-hidden"
                        >
                          <div className="flex-1 rtl:text-right">
                             <h3 className="text-base font-bold font-cairo text-orange-450">مربع تدقيق ومطابقة البيانات (Audit)</h3>
                             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">فحص ومعالجة التضاربات بين عدادات البرنامج وسجلات قاعدة البيانات</p>
                          </div>
                          <div className="p-2.5 bg-orange-600/15 text-orange-500 rounded-xl group-hover:scale-105 transition-transform">
                             <Shield size={22} />
                          </div>
                        </motion.button>

                        {/* Backup Block */}
                        <motion.button
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setBackupSubTab('backup_manual')}
                          className="w-full bg-white/5 text-white p-3.5 rounded-[1.2rem] border border-white/10 flex items-center gap-3 shadow-xl relative group overflow-hidden"
                        >
                          <div className="flex-1 rtl:text-right">
                             <h3 className="text-base font-bold font-cairo">النسخ الاحتياطي</h3>
                             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">نسخ محلي وتلقائي للبيانات</p>
                          </div>
                          <div className="p-2.5 bg-purple-600/10 text-purple-500 rounded-xl">
                             <Database size={22} />
                          </div>
                        </motion.button>

                        {/* Export Block */}
                        <motion.button
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setBackupSubTab('export')}
                          className="w-full bg-white/5 text-white p-3.5 rounded-[1.2rem] border border-white/10 flex items-center gap-3 shadow-xl relative group overflow-hidden"
                        >
                          <div className="flex-1 rtl:text-right">
                             <h3 className="text-base font-bold font-cairo">تصدير بلاس</h3>
                             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">تصدير شامل ومنظم للسجلات</p>
                          </div>
                          <div className="p-2.5 bg-emerald-600/10 text-emerald-500 rounded-xl">
                             <Download size={22} />
                          </div>
                        </motion.button>

                        {/* Import Block */}
                        <motion.button
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setBackupSubTab('import')}
                          className="w-full bg-white/5 text-white p-3.5 rounded-[1.2rem] border border-white/10 flex items-center gap-3 shadow-xl relative group overflow-hidden"
                        >
                          <div className="flex-1 rtl:text-right">
                             <h3 className="text-base font-bold font-cairo">الاستيراد والاستعادة</h3>
                             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">استعادة أو دمج بيانات سابقة</p>
                          </div>
                          <div className="p-2.5 bg-orange-600/10 text-orange-500 rounded-xl">
                             <Upload size={22} />
                          </div>
                        </motion.button>

                        {/* Archive Block */}
                        <motion.button
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setBackupSubTab('archive')}
                          className="w-full bg-white/5 text-white p-3.5 rounded-[1.2rem] border border-white/10 flex items-center gap-3 shadow-xl relative group overflow-hidden"
                        >
                          <div className="flex-1 rtl:text-right">
                             <h3 className="text-base font-bold font-cairo">أرشفة الملفات</h3>
                             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">مسح وتفريغ السجلات المنتهية</p>
                          </div>
                          <div className="p-2.5 bg-gray-600/10 text-gray-500 rounded-xl">
                             <Archive size={22} />
                          </div>
                        </motion.button>


                        {/* Reset Block */}
                        <motion.button
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          type="button"
                          onClick={() => {
                            console.log('Manual click on Reset Button');
                            resetAllDataTemp();
                          }}
                          className="w-full bg-red-500/10 text-red-500 p-5 rounded-[1.2rem] border border-red-500/20 flex items-center gap-3 shadow-xl mt-4 cursor-pointer active:bg-red-500/20"
                        >
                          <div className="flex-1 text-right rtl:text-right">
                             <h3 className="text-base font-bold font-cairo">تهيئة النظام (ضبط المصنع)</h3>
                             <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-0.5 select-none">Factory Wipe & Data Reset</p>
                          </div>
                          <div className="p-3 bg-red-500 text-white rounded-xl shadow-lg">
                             <RotateCcw size={24} />
                          </div>
                        </motion.button>
                        <div className="h-10" /> {/* Extra space at the bottom */}
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                          <button 
                            onClick={() => setBackupSubTab('list')}
                            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/5 mb-4"
                            title="العودة للقائمة"
                          >
                             <ArrowRight size={18} />
                          </button>

                         {backupSubTab === 'backup_manual' && (
                            <section className="bg-white/5 rounded-[1.5rem] border border-white/10 overflow-hidden shadow-2xl">
                               <div className="p-5 md:p-8 border-b border-white/5 bg-gradient-to-br from-emerald-600/10 to-transparent flex items-center justify-between rtl:flex-row-reverse">
                                  <div className="flex items-center gap-4 rtl:flex-row-reverse">
                                    <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg ring-2 ring-emerald-600/20">
                                      <Database size={24} />
                                    </div>
                                    <div className="rtl:text-right">
                                      <h2 className="font-mono text-xl font-black text-white uppercase tracking-tighter">النسخ الاحتياطي</h2>
                                      <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Control Panel</p>
                                    </div>
                                  </div>
                               </div>
                               <div className="p-5 md:p-8 space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="p-5 bg-black/40 rounded-[1.5rem] border border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-3">
                                              <div className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl"><Clock size={24} /></div>
                                              <span className="font-bold text-sm text-white">النسخ التلقائي</span>
                                           </div>
                                           <label className="relative inline-flex items-center cursor-pointer scale-110">
                                              <input type="checkbox" checked={autoBackup} onChange={e => setAutoBackup(e.target.checked)} className="sr-only peer" />
                                              <div className="w-12 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                                           </label>
                                        </div>
                                        {autoBackup && (
                                           <div className="space-y-2 pt-2 border-t border-white/5">
                                              <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest block rtl:text-right">وقت النسخ</label>
                                              <input type="time" value={backupTime} onChange={e => setBackupTime(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-2xl font-mono text-center focus:border-emerald-500 outline-none" />
                                           </div>
                                        )}
                                     </div>
                                     <div className="p-5 bg-black/40 rounded-[1.5rem] border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3">
                                           <div className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl"><HardDrive size={24} /></div>
                                           <span className="font-bold text-sm text-white">مسار التخزين</span>
                                        </div>
                                        <input type="text" readOnly value={backupPath} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-gray-400 truncate" />
                                     </div>
                                  </div>
                                  <div className="flex gap-4">
                                     <button onClick={handleSaveSettings} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-[1.5rem] font-bold text-base shadow-2xl transition-all active:scale-95">حفظ الإعدادات</button>
                                     <button 
                                       disabled={backupLoading}
                                       onClick={handleExportBackup} 
                                       className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-[1.5rem] font-bold text-base shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                                     >
                                       {backupLoading ? 'جاري النسخ...' : 'نسخ احتياطي الآن'}
                                     </button>
                                  </div>
                               </div>
                            </section>
                         )}

                         {backupSubTab === 'export' && (
                            <section className="bg-white/5 rounded-[1.5rem] border border-white/10 p-5 text-center space-y-4">
                               <div className="p-4 bg-emerald-600/10 text-emerald-500 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                  <Download size={28} />
                               </div>
                               <div>
                                  <h3 className="text-xl font-black text-white font-cairo">تصدير بلاس</h3>
                                  <p className="text-gray-500 mt-1 text-[10px]">تجهيز ملف شامل لجميع بيانات النظام بتنسيق JSON</p>
                               </div>
                               <button 
                                 disabled={backupLoading}
                                 onClick={handleExportBackup} 
                                 className="bg-white text-black px-6 py-2.5 rounded-lg font-black text-xs hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 mx-auto disabled:opacity-50"
                               >
                                  <Download size={16} />
                                  <span>{backupLoading ? 'جاري التصدير...' : 'بدء التصـدير'}</span>
                               </button>
                            </section>
                         )}

                         {backupSubTab === 'import' && (
                            <section className="bg-white/5 rounded-[1.5rem] border border-white/10 p-5 text-center space-y-4">
                               <div className="p-4 bg-orange-600/10 text-orange-500 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                  <Upload size={28} />
                               </div>
                               <div>
                                  <h3 className="text-xl font-black text-white font-cairo">الاستيراد والاستعادة</h3>
                                  <p className="text-gray-500 mt-1 text-[10px]">اختر ملف النسخة الاحتياطية لاستعادة السجلات</p>
                               </div>
                               <label className={`max-w-xs mx-auto border border-dashed border-white/20 p-4 rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer group block ${backupLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                  <FileText className="mx-auto text-gray-600 group-hover:text-orange-500 transition-colors" size={32} />
                                  <p className="mt-2 text-[9px] text-gray-500">{backupLoading ? 'جاري الاستعادة...' : 'اختر الملف من الذاكرة'}</p>
                                  <input 
                                    type="file" 
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleImportBackup}
                                  />
                               </label>
                            </section>
                         )}

                         {backupSubTab === 'archive' && (
                            <section className="bg-white/5 rounded-[1.5rem] border border-white/10 p-5 text-center space-y-4">
                               <div className="p-4 bg-gray-600/10 text-gray-400 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                  <Archive size={28} />
                               </div>
                               <div>
                                  <h3 className="text-xl font-black text-white font-cairo">أرشفة الملفات</h3>
                                  <p className="text-gray-500 mt-1 text-[10px]">نقل السجلات القديمة المنتهية لقاعدة بيانات الأرشيف</p>
                               </div>
                               <div className="flex justify-center max-w-sm mx-auto">
                                  <button 
                                    disabled={backupLoading}
                                    onClick={handleArchive}
                                    className="bg-white/10 text-white font-black rounded-lg px-8 py-3 hover:bg-white/20 transition-all text-xs disabled:opacity-50"
                                  >
                                    {backupLoading ? 'جاري التنفيذ...' : 'مسح السجلات المنتهية (أقدم من 12 شهر)'}
                                  </button>
                               </div>
                            </section>
                         )}

                         {backupSubTab === 'stats' && (
                            <section className="bg-white/5 rounded-[1.5rem] border border-white/10 p-4 space-y-4">
                               <div className="flex items-center gap-3 rtl:flex-row-reverse">
                                  <div className="p-3 bg-blue-600 text-white rounded-lg shadow-xl"><Database size={20} /></div>
                                  <div className="rtl:text-right">
                                     <h3 className="text-lg font-black text-white font-cairo">تفاصيل قاعدة البيانات</h3>
                                     <p className="text-[8px] text-gray-500">فحص الحالة وتوافر البيانات</p>
                                  </div>
                               </div>
                               <div className="grid grid-cols-2 gap-2">
                                  {[
                                     { label: 'الفواتير المسجلة', value: statsData.invoices, icon: FileText, color: 'text-blue-500' },
                                     { label: 'العملاء المسجلين', value: statsData.customers, icon: Smartphone, color: 'text-purple-500' },
                                     { label: 'عمليات الصيانة', value: statsData.maintenance, icon: RefreshCw, color: 'text-orange-500' },
                                     { label: 'رقم الفاتورة القادمة', value: invoiceCounter + 1, icon: Shield, color: 'text-emerald-500' },
                                  ].map((stat, i) => (
                                     <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center text-center gap-1.5">
                                        <stat.icon className={stat.color} size={16} />
                                        <span className="text-sm font-black text-white">{stat.value}</span>
                                        <span className="text-[7px] text-gray-500 uppercase font-black">{stat.label}</span>
                                     </div>
                                  ))}
                               </div>
                            </section>
                         )}

                         {backupSubTab === 'audit' && (
                            <section className="bg-white/5 rounded-[1.5rem] border border-white/10 p-5 space-y-6 rtl:text-right text-gray-200">
                              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3 rtl:flex-row-reverse">
                                  <div className="p-3 bg-orange-600/15 text-orange-500 rounded-xl">
                                    <Shield size={24} />
                                  </div>
                                  <div className="rtl:text-right">
                                    <h3 className="text-lg font-bold text-white font-cairo">تدقيق ومطابقة السجلات الفعلية (Interactive Database Audit)</h3>
                                    <p className="text-xs text-gray-400">تحقق ومقارنة العدادات المسجلة في واجهة الإعدادات والعمليات المالية مع سجلات خادم قاعدة البيانات</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={runDatabaseAudit} 
                                  disabled={isAuditing}
                                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                                >
                                  <RefreshCw size={14} className={isAuditing ? "animate-spin" : ""} />
                                  <span>تحديث الفحص</span>
                                </button>
                              </div>

                              {isAuditing ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-4">
                                  <RefreshCw size={36} className="animate-spin text-orange-500" />
                                  <p className="text-sm text-gray-400 font-bold">جاري تشغيل خوارزميات الفحص والمطابقة لجميع عناصر قاعدة البيانات...</p>
                                </div>
                              ) : auditResults ? (
                                <div className="space-y-6">
                                  {repairProgress.message && (
                                    <div className={`p-4 rounded-2xl border text-xs font-bold ${
                                      repairProgress.status === 'running' ? 'bg-orange-600/10 border-orange-500/30 text-orange-400 font-mono' :
                                      repairProgress.status === 'completed' ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-bold' :
                                      repairProgress.status === 'error' ? 'bg-red-600/10 border-red-500/30 text-red-400 font-bold' : 'bg-white/5 border-white/10 text-white'
                                    }`}>
                                      <p>{repairProgress.message}</p>
                                    </div>
                                  )}

                                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-orange-600/10 to-amber-600/5 rounded-2.5xl border border-orange-500/15 gap-4">
                                    <div className="text-right flex-1 select-none">
                                      <p className="text-white font-black text-sm">تسوية وتصحيح التضاربات تلقائياً</p>
                                      <p className="text-xs text-gray-400 mt-1">تقوم الأداة بمطابقة العدادات، موازنة حركات الصندوق المتصلة بالفواتير الحالية، وتسوية وتصفية مجاميع وعلاقات الفواتير بكبسة زر واحدة.</p>
                                    </div>
                                    <button
                                      onClick={repairAllDiscrepancies}
                                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-black text-xs shadow-xl transition-all text-center shrink-0"
                                    >
                                      إصلاح وتصحيح التضاربات تلقائياً
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-white">عداد تسلسل الفواتير</span>
                                        {auditResults.invoiceCounter.conflict ? (
                                          <span className="px-2.5 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black">تضارب مكتشف</span>
                                        ) : (
                                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black">سليم</span>
                                        )}
                                      </div>
                                      <div className="text-xs space-y-1 text-gray-400 text-right">
                                        <p>العداد المسجل بالإعدادات: <strong className="text-white font-mono">{auditResults.invoiceCounter.registered}</strong></p>
                                        <p>أعلى رقم فاتورة فعلي باللائحة: <strong className="text-white font-mono">{auditResults.invoiceCounter.actualMax}</strong></p>
                                      </div>
                                    </div>

                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-white">عداد تسلسل أرقام العملاء</span>
                                        {auditResults.customerCounter.conflict ? (
                                          <span className="px-2.5 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black">تضارب مكتشف</span>
                                        ) : (
                                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black">سليم</span>
                                        )}
                                      </div>
                                      <div className="text-xs space-y-1 text-gray-400 text-right">
                                        <p>العداد المسجل بالإعدادات: <strong className="text-white font-mono">{auditResults.customerCounter.registered}</strong></p>
                                        <p>أعلى رقم تسلسلي للعملاء باللائحة: <strong className="text-white font-mono">{auditResults.customerCounter.actualMax}</strong></p>
                                      </div>
                                    </div>

                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-white">مطابقة قيمة الفاتورة ومجاميع الأجهزة</span>
                                        {auditResults.totalDiscrepancies.length > 0 ? (
                                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black">{auditResults.totalDiscrepancies.length} تباينات</span>
                                        ) : (
                                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black">سليم</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400">يتحقق من دقة اجمالي سعر الفاتورة الأم مقارنة بمجموع تكلفة أجهزة الصيانة المسجلة بداخلها.</p>
                                      {auditResults.totalDiscrepancies.length > 0 && (
                                        <div className="max-h-24 overflow-y-auto space-y-1.5 p-2 bg-black/40 rounded-xl font-mono text-[10px] text-red-300 text-right">
                                          {auditResults.totalDiscrepancies.map((d: any, idx: number) => (
                                            <p key={idx}>فاتورة #{d.invoiceNumber}: الفاتورة ({d.currentTotal}) ↔ المجموع الحقيقي ({d.computedTotal})</p>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-white">مطابقة الحالات والوضع الفني للعمليات</span>
                                        {auditResults.statusDiscrepancies.length > 0 ? (
                                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-black">{auditResults.statusDiscrepancies.length} اختلافات</span>
                                        ) : (
                                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black">سليم</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400">فحص ملخص الفاتورة الخارجي ومطابقته بذكاء بمراحل الصيانة الفنية الفردية الملحقة.</p>
                                      {auditResults.statusDiscrepancies.length > 0 && (
                                        <div className="max-h-24 overflow-y-auto space-y-1.5 p-2 bg-black/30 rounded-xl font-mono text-[10px] text-amber-300 text-right">
                                          {auditResults.statusDiscrepancies.map((d: any, idx: number) => (
                                            <p key={idx}>فاتورة #{d.invoiceNumber}: مسجل ({d.currentStatus}) ↔ الفعلي ({d.expectedStatus})</p>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-white">تطابق الصندوق والمدفوعات</span>
                                        {auditResults.paymentImbalances.length > 0 ? (
                                          <span className="px-2.5 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black">{auditResults.paymentImbalances.length} عدم تطابق</span>
                                        ) : (
                                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black">سليم</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400">مقارنة وتدقيق المدفوعات المسجلة بالفاتورة مقابل القيود المقبوضة فعلياً في صندوق الخزينة الحقيقية.</p>
                                      {auditResults.paymentImbalances.length > 0 && (
                                        <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 bg-black/30 rounded-xl font-mono text-[10px] text-red-300 text-right">
                                          {auditResults.paymentImbalances.map((d: any, idx: number) => (
                                            <p key={idx}>فاتورة #{d.invoiceNumber}: الفاتورة ({d.amountPaidOnInvoice}) ↔ المقبوض بالصندوق ({d.amountInLedger})</p>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-white">السجلات اليتيمة والتالفة</span>
                                        {(auditResults.orphanedItems.length > 0 || auditResults.emptyInvoices.length > 0) ? (
                                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-black">تباينات مكتشفة</span>
                                        ) : (
                                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black">سليم</span>
                                        )}
                                      </div>
                                      <div className="text-xs space-y-1 text-gray-400 text-right">
                                        <p>قطع غيار صيانة يتيمة بلا فواتير رئيسية: <strong className="text-white font-mono">{auditResults.orphanedItems.length}</strong></p>
                                        <p>فواتير فارغة كلياً بلا أجهزة مسجلة: <strong className="text-white font-mono">{auditResults.emptyInvoices.length}</strong></p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-12 text-gray-500 select-none">
                                   يرجى النقر فوق "تحديث الفحص" لبدء مراجعة قواعد البيانات والعمليات المتراكمة وتحقيق السلامة.
                                </div>
                              )}
                            </section>
                          )}
                      </motion.div>
                    )}
                  </div>
                )}


                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                
                {activeTab === 'advanced-management' && (
                  <div className="space-y-6 pb-8 text-right font-cairo" dir="rtl">
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">
                      <button type="button" onClick={() => { setAdvancedTab('database'); setActiveAdvancedModal('database'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Database size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">قاعدة البيانات والمزامنة</h3>
                            <p className="text-xs text-gray-400 mt-1">إعدادات قاعدة البيانات والربط</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      <button type="button" onClick={() => { setAdvancedTab('general_manager'); setActiveAdvancedModal('general_manager'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <UserIcon size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">المدير العام</h3>
                            <p className="text-xs text-gray-400 mt-1">إعدادات المدير العام للصيانة</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      <button type="button" onClick={() => {
                            if (window.confirm('هل أنت متأكد من اعتماد الإعدادات الجديدة وإعادة تشغيل النظام؟ سيتم تسجيل الخروج.')) {
                              setSaving(true);
                              sessionStorage.removeItem('snd_user');
                              window.location.reload();
                            }
                          }} className="w-full flex items-center justify-between p-6 bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 hover:border-green-500/50 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-green-600/20 text-green-500 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                            <CheckCircle size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">تأكيد واعتماد النظام</h3>
                            <p className="text-xs text-gray-400 mt-1">حفظ الإعدادات وإعادة تشغيل النظام</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      <button type="button" onClick={() => { setAdvancedTab('system_reset'); setActiveAdvancedModal('system_reset'); }} className="w-full flex items-center justify-between p-6 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 hover:border-red-500/50 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                            <RotateCcw size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-red-500 text-base">إعادة التهيئة (System Reset)</h3>
                            <p className="text-xs text-red-400/70 mt-1">مسح جميع البيانات وإعادة النظام لحالة المصنع</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-red-500 group-hover:translate-x-[-4px] transition-all" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {activeAdvancedModal !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a1a] w-full h-full sm:h-[85vh] max-w-4xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
                          >
                            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/20 sticky top-0 z-10 backdrop-blur-md">
                              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                {activeAdvancedModal === 'database' && <Database className="text-orange-500" size={20} />}
                                {activeAdvancedModal === 'general_manager' && <UserIcon className="text-orange-500" size={20} />}
                                {activeAdvancedModal === 'system_reset' && <RotateCcw className="text-red-500" size={20} />}
                                {activeAdvancedModal === 'database' && 'قاعدة البيانات والمزامنة'}
                                {activeAdvancedModal === 'general_manager' && 'المدير العام'}
                                {activeAdvancedModal === 'system_reset' && 'إعادة التهيئة'}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setActiveAdvancedModal(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer"
                              >
                                <X size={24} />
                              </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
                              {activeAdvancedModal === 'database' && (
                          <div className="space-y-6 animate-in fade-in duration-200">
                             <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                                <h4 className="font-bold text-white text-sm">إعداد قاعدة البيانات والربط</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveDbMode('LOCAL')}
                                    className={`p-5 rounded-2xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                      dbMode === 'LOCAL'
                                        ? 'bg-orange-600/10 border-orange-600 text-orange-500 shadow-xl'
                                        : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                                    }`}
                                  >
                                    <HardDrive size={24} className={dbMode === 'LOCAL' ? 'text-orange-500' : 'text-gray-400'} />
                                    <div className="text-center">
                                      <span className="block font-bold text-xs">محلي (LOCAL)</span>
                                      <span className="text-[9px] text-gray-500 block mt-0.5">الأساسية الافتراضية</span>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleSaveDbMode('CLOUD')}
                                    className={`p-5 rounded-2xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                      dbMode === 'CLOUD'
                                        ? 'bg-orange-600/10 border-orange-600 text-orange-500 shadow-xl'
                                        : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                                    }`}
                                  >
                                    <Globe size={24} className={dbMode === 'CLOUD' ? 'text-orange-500' : 'text-gray-400'} />
                                    <div className="text-center">
                                      <span className="block font-bold text-xs">سحابي (CLOUD)</span>
                                      <span className="text-[9px] text-gray-500 block mt-0.5">Firebase</span>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleSaveDbMode('AUTO')}
                                    className={`p-5 rounded-2xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                      dbMode === 'AUTO'
                                        ? 'bg-orange-600/10 border-orange-600 text-orange-500 shadow-xl'
                                        : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                                    }`}
                                  >
                                    <RefreshCw size={24} className={dbMode === 'AUTO' ? 'text-orange-500' : 'text-gray-400'} />
                                    <div className="text-center">
                                      <span className="block font-bold text-xs">هجين (AUTO)</span>
                                      <span className="text-[9px] text-gray-500 block mt-0.5">مزامنة ذكية</span>
                                    </div>
                                  </button>
                                </div>
                                {dbMode === 'LOCAL' && (
                                   <div className="space-y-4 pt-4 border-t border-white/5">
                                      <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 block">مسار حفظ قاعدة البيانات</label>
                                        <input type="text" value={backupPath} onChange={(e) => setBackupPath(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-left text-white" dir="ltr" />
                                      </div>
                                   </div>
                                )}
                                {(dbMode === 'CLOUD' || dbMode === 'AUTO') && (
                                   <div className="space-y-4 pt-4 border-t border-white/5">
                                      <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 block">إعدادات الاتصال السحابي</label>
                                        <div className="p-4 bg-black/40 rounded-xl border border-white/10 text-sm text-gray-400">
                                           (جاري استخدام إعدادات الاتصال المضمنة حالياً)
                                        </div>
                                      </div>
                                   </div>
                                )}
                                <div className="pt-4 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => alert('تم حفظ الإعدادات، يرجى الضغط على تأكيد واعتماد النظام لتطبيقها.')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                                  >
                                    تأكيد الإعدادات (حفظ مؤقت)
                                  </button>
                                </div>
                             </div>

                             <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <h4 className="font-bold text-white text-sm">مصدر البيانات الحالي والمزامنة</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-600/10 text-orange-500">
                                      <Database size={18} />
                                    </div>
                                    <div className="flex-1">
                                      <span className="text-xs text-gray-500 block">القاعدة المعتمدة</span>
                                      <span className="text-sm font-bold text-white">{activeProvider === 'LOCAL' ? 'محلي (SQLite)' : 'سحابي (Firebase)'}</span>
                                    </div>
                                    <button 
                                      onClick={() => alert('تم إلغاء الربط')} 
                                      disabled={dbMode === 'LOCAL'}
                                      className="px-3 py-1.5 text-xs bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-bold disabled:opacity-50"
                                    >
                                      إلغاء الربط
                                    </button>
                                  </div>
                                  <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-600/10 text-orange-500">
                                      <Globe size={18} />
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block">حالة اتصال الشبكة</span>
                                      <span className={`text-sm font-bold ${navigator.onLine ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {navigator.onLine ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div>
                                    <h4 className="font-bold text-white text-xs">مزامنة البيانات السحابية والمحلية</h4>
                                    <p className="text-[10px] text-gray-500 mt-0.5">آخر مزامنة: الآن</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleSyncNow}
                                    disabled={syncLoading}
                                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-center"
                                  >
                                    {syncLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    مزامنة الآن
                                  </button>
                                </div>
                                {syncResult.type && (
                                  <div className={`p-4 rounded-xl text-xs font-bold border ${syncResult.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                    {syncResult.message}
                                  </div>
                                )}
                             </div>
                          </div>
                        
                              )}
                              {activeAdvancedModal === 'general_manager' && (
                          <div className="space-y-6 animate-in fade-in duration-200">
                             <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <h4 className="font-bold text-white text-sm">المدير العام</h4>
                                <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-3">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-lg">أ</div>
                                      <div>
                                        <h3 className="font-bold text-white text-sm">المدير العام</h3>
                                        <p className="text-[10px] text-gray-500">@admin</p>
                                      </div>
                                   </div>
                                   <button onClick={async () => {
                                     const newPass = window.prompt('أدخل كلمة المرور الجديدة للمدير العام:');
                                     if (!newPass) return;
                                     try {
                                        const { collection, query, where, getDocs, updateDoc, doc } = await import('../firebase');
                                        const { db } = await import('../firebase');
                                        const q = query(collection(db, 'users'), where('username', '==', 'admin'));
                                        const snap = await getDocs(q);
                                        if (!snap.empty) {
                                           await updateDoc(doc(db, 'users', snap.docs[0].id), { password: newPass });
                                           alert('تم تغيير كلمة المرور للمدير العام بنجاح');
                                        } else {
                                           alert('حساب المدير العام غير موجود');
                                        }
                                     } catch (e) {
                                        alert('حدث خطأ');
                                     }
                                   }} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white border border-orange-500/20 font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-lg cursor-pointer">
                                      <Lock size={13} />
                                      تغيير كلمة المرور
                                   </button>
                                </div>
                                <div className="mt-4">
                                  <label className="text-xs font-bold text-gray-500 mb-2 block">البريد الإلكتروني لاستعادة كلمة المرور (اختياري)</label>
                                  <input type="email" placeholder="email@example.com" className="w-full max-w-sm bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-left text-white" dir="ltr" />
                                </div>
                             </div>

                             <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <SystemManagersList />
                             </div>
                          </div>
                        
                              )}
                              {activeAdvancedModal === 'system_reset' && (
                          <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6 text-center animate-in fade-in duration-200">
                             <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                <Shield size={40} />
                             </div>
                             <div>
                                <h3 className="text-xl font-bold text-white mb-2">إعادة التهيئة الشاملة</h3>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto">
                                   سيتم مسح كافة البيانات والسجلات والعودة إلى وضع التهيئة الافتراضي للنظام.
                                </p>
                             </div>
                             <button
                               onClick={() => resetAllDataTemp()}
                               className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-red-900/20"
                             >
                               تأكيد إعادة التهيئة
                             </button>
                          </div>
                        
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeTab === 'management' && (
                  <div className="space-y-6 pb-8 text-right font-cairo" dir="rtl">
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">
                      <button type="button" onClick={() => { setManagementTab('database_read'); setActiveManagementModal('database_read'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Database size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">بيانات قاعدة البيانات</h3>
                            <p className="text-xs text-gray-400 mt-1">عرض وتصدير بيانات قاعدة البيانات</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>
                      <button type="button" onClick={() => { setManagementTab('backup'); setActiveManagementModal('backup'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Download size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">النسخ الاحتياطي</h3>
                            <p className="text-xs text-gray-400 mt-1">إدارة عمليات النسخ الاحتياطي والأرشفة</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>
                      <button type="button" onClick={() => { setManagementTab('devices'); setActiveManagementModal('devices'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Smartphone size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">إدارة الأجهزة المسموحة</h3>
                            <p className="text-xs text-gray-400 mt-1">إدارة الأجهزة المصرح لها بالدخول للنظام</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {activeManagementModal !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a1a] w-full h-full sm:h-[85vh] max-w-4xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
                          >
                            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/20 sticky top-0 z-10 backdrop-blur-md">
                              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                {activeManagementModal === 'database_read' && <Database className="text-orange-500" size={20} />}
                                {activeManagementModal === 'backup' && <Download className="text-orange-500" size={20} />}
                                {activeManagementModal === 'devices' && <Smartphone className="text-orange-500" size={20} />}
                                {activeManagementModal === 'database_read' && 'بيانات قاعدة البيانات'}
                                {activeManagementModal === 'backup' && 'النسخ الاحتياطي'}
                                {activeManagementModal === 'devices' && 'إدارة الأجهزة المسموحة'}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setActiveManagementModal(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer"
                              >
                                <X size={24} />
                              </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
                              {activeManagementModal === 'database_read' && (
                          <div className="space-y-6 animate-in fade-in duration-200">
                             <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <h4 className="font-bold text-white text-sm">نوع قاعدة البيانات النشطة: {dbMode}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-500">
                                      <Database size={18} />
                                    </div>
                                    <div className="flex-1">
                                      <span className="text-xs text-gray-500 block">مصدر البيانات النشط</span>
                                      <span className="text-sm font-bold text-white">{activeProvider === 'LOCAL' ? 'محلي (SQLite)' : 'سحابي (Firebase)'}</span>
                                    </div>
                                  </div>
                                  <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-500">
                                      <Globe size={18} />
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block">حالة اتصال الشبكة</span>
                                      <span className={`text-sm font-bold ${navigator.onLine ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {navigator.onLine ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div>
                                    <h4 className="font-bold text-white text-xs">المزامنة</h4>
                                    <p className="text-[10px] text-gray-500 mt-0.5">آخر مزامنة: اليوم</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleSyncNow}
                                    disabled={syncLoading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-center"
                                  >
                                    {syncLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    مزامنة الآن
                                  </button>
                                </div>
                                {syncResult.type && (
                                  <div className={`p-4 rounded-xl text-xs font-bold border ${syncResult.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                    {syncResult.message}
                                  </div>
                                )}
                             </div>
                          </div>
                        
                              )}
                              {activeManagementModal === 'backup' && (
                           <div className="animate-in fade-in duration-200">
                             <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <h4 className="font-bold text-white text-sm">أدوات الصيانة والنسخ الاحتياطي</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <button
                                    type="button"
                                    onClick={handleExportBackup}
                                    disabled={backupLoading}
                                    className="flex items-center gap-3 p-4 bg-[#1e1e1e] hover:bg-[#252525] rounded-2xl border border-white/5 hover:border-blue-500/30 text-right transition-all group shadow-md disabled:opacity-50"
                                  >
                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                      <Download size={20} />
                                    </div>
                                    <div className="flex-1">
                                      <span className="block text-sm font-bold text-white">تصدير بلاس JSON</span>
                                      <span className="block text-[10px] text-gray-500 mt-0.5">تصدير ملف شامل للبيانات</span>
                                    </div>
                                  </button>
                                  <label className="flex items-center gap-3 p-4 bg-[#1e1e1e] hover:bg-[#252525] rounded-2xl border border-white/5 hover:border-blue-500/30 text-right transition-all group shadow-md cursor-pointer">
                                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                                      <Upload size={20} />
                                    </div>
                                    <div className="flex-1">
                                      <span className="block text-sm font-bold text-white">الاستيراد والاستعادة</span>
                                      <span className="block text-[10px] text-gray-500 mt-0.5">استعادة السجلات من ملف</span>
                                    </div>
                                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                                  </label>
                                </div>
                             </div>
                           </div>
                        
                              )}
                              {activeManagementModal === 'devices' && (
                          <div className="animate-in fade-in duration-200">
                            <DeviceManagement user={user} onBack={() => setManagementTab('database_read')} shopConfig={shopConfig} />
                          </div>
                        
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Dialog for Reset Confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1a1a1a] w-full max-w-md rounded-[2rem] border border-red-500/30 shadow-2xl p-6 text-center space-y-6"
            >
              <div className="p-4 bg-red-500/10 text-red-500 rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-red-500/20 shadow-inner">
                <RotateCcw size={40} className="animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-cairo">تأكيد تهيئة النظام بالكامل؟</h3>
                <p className="text-gray-400 text-sm font-cairo leading-relaxed">
                  تحذير: سيتم حذف كافة البيانات من التطبيق نهائياً (بما في ذلك الفواتير، العملاء، الحركات المالية، الإعدادات، والحسابات الإضافية) وتصفير جميع العدادات والمبيعات. لا يمكن التراجع عن هذا الإجراء!
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    resetAllDataTemp(true); // Bypass and run deletion
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold font-cairo transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  نعم، احذف كل شيء
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-bold font-cairo transition-all active:scale-95 border border-white/10 cursor-pointer"
                >
                  إلغاء الأمر
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Custom Reset Status Modal */}
        {resetStatus.type && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-[2rem] border p-6 text-center space-y-6 ${
                resetStatus.type === 'success' 
                  ? 'bg-[#121212] border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]' 
                  : 'bg-[#121212] border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]'
              }`}
            >
              <div className={`p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center border shadow-inner ${
                resetStatus.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {resetStatus.type === 'success' ? <CheckCircle size={40} className="animate-bounce" /> : <XCircle size={40} />}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-cairo">
                  {resetStatus.type === 'success' ? 'تمت تهيئة النظام!' : 'فشل الإجراء'}
                </h3>
                <p className="text-gray-350 text-sm font-cairo leading-relaxed">
                  {resetStatus.message}
                </p>
              </div>

              {resetStatus.type === 'error' && (
                <button
                  type="button"
                  onClick={() => setResetStatus({ type: null, message: '' })}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold font-cairo transition-all cursor-pointer"
                >
                  حسناً
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DeviceSupportWarning({ type }: { type: 'biometric' | 'pin' }) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const info = await Device.getInfo();
      if (info.platform === 'web' && type === 'biometric') {
        setSupported(false);
        return;
      }
      if (type === 'biometric') {
        try {
          const bio = await NativeBiometric.isAvailable();
          setSupported(bio.isAvailable);
        } catch {
          setSupported(false);
        }
      } else {
        setSupported(true);
      }
    };
    check();
  }, [type]);

  if (supported === false) {
    return (
      <p className="text-[10px] text-red-400 font-bold mt-1 animate-pulse">
        ⚠️ هذا الجهاز لا يدعم {type === 'biometric' ? 'البصمة' : 'PIN'}
      </p>
    );
  }
  return null;
}
