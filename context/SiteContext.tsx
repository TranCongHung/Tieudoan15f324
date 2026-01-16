import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { storage } from '../services/storage';

interface SiteContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
  resetSettings: () => void;
}

const SiteContext = createContext<SiteContextType | null>(null);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(storage.getSettings());

  useEffect(() => {
    // Load initial settings
    setSettings(storage.getSettings());
  }, []);

  const updateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const resetSettings = () => {
    const defaults = storage.getSettings(); // Or better, the hardcoded initial
    // For now we just reload from storage, but in a real app we might want a factory reset
    localStorage.removeItem('site_settings');
    const fresh = storage.getSettings();
    setSettings(fresh);
  };

  return (
    <SiteContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {/* Inject Custom CSS if present */}
      {settings.customCss && (
          <style dangerouslySetInnerHTML={{ __html: settings.customCss }} />
      )}
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSiteSettings must be used within SiteProvider");
  return context;
};
