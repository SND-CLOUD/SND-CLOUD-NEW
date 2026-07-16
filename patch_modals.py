import re

with open('src/components/Settings.tsx', 'r') as f:
    content = f.read()

# Add states
states_injection = """
  const [activeAdvancedModal, setActiveAdvancedModal] = useState<'database' | 'devices' | 'general_manager' | 'system_reset' | 'confirm_system' | null>(null);
  const [activeManagementModal, setActiveManagementModal] = useState<'database_read' | 'backup' | 'devices' | null>(null);
"""
content = re.sub(r"(const \[activeAccountingInputsModal.*?useState.*?null\);)", r"\1" + states_injection, content)

# Update isSettingsDeepView calculation
deepview_calc_regex = r"(\(window as any\)\.isSettingsDeepView = activeTab !== 'main'.*?activeAccountingInputsModal !== null);"
deepview_calc_replacement = r"\1 || activeAdvancedModal !== null || activeManagementModal !== null;"
content = re.sub(deepview_calc_regex, deepview_calc_replacement, content)

# Update handleCloseDeepView
handleCloseDeepView_regex = r"(} else if \(activeAccountingInputsModal !== null\) {\s*setActiveAccountingInputsModal\(null\);\s*})"
handleCloseDeepView_replacement = r"\1 else if (activeAdvancedModal !== null) { setActiveAdvancedModal(null); } else if (activeManagementModal !== null) { setActiveManagementModal(null); }"
content = re.sub(handleCloseDeepView_regex, handleCloseDeepView_replacement, content)

# Update dependency array
deps_regex = r"(}, \[activeTab, activeGeneralModal, activeCategoriesEngineersModal, activeAccountingInputsModal)(]);"
deps_replacement = r"\1, activeAdvancedModal, activeManagementModal\2;"
content = re.sub(deps_regex, deps_replacement, content)

with open('src/components/Settings.tsx', 'w') as f:
    f.write(content)
