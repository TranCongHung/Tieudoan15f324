
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { apiService } from '../services/api';

interface SiteContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

const SiteContext = createContext<SiteContextType | null>(null);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>({
    siteTitle: 'Tiểu đoàn 15',
    siteSubtitle: 'Sư đoàn 324',
    logoUrl: '',
    primaryColor: '#14532d',
    secondaryColor: '#eab308',
    heroImage: '',
    heroTitle: '',
    heroSubtitle: '',
    contactAddress: '',
    contactEmail: '',
    contactPhone: '',
    customCss: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
        try {
            const data = await apiService.getSettings();
            // Chỉ cập nhật nếu data có nội dung (không trống)
            if (Object.keys(data).length > 0) {
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Không thể tải cấu hình từ server:", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    await apiService.saveSettings(newSettings);
  };

  const resetSettings = () => {
    if (window.confirm("Đồng chí có chắc muốn khôi phục giao diện mặc định?")) {
        const defaults: SiteSettings = {
            siteTitle: 'Tiểu đoàn 15',
            siteSubtitle: 'Sư đoàn 324 - Quân Khu 4',
            logoUrl: '',
            primaryColor: '#14532d',
            secondaryColor: '#eab308',
            heroImage: 'https://picsum.photos/1920/1080?grayscale&blur=2',
            heroTitle: 'Phát huy truyền thống Đoàn Ngự Bình',
            heroSubtitle: 'Tiểu đoàn 15 quyết tâm hoàn thành xuất sắc mọi nhiệm vụ được giao, xứng danh Bộ đội Cụ Hồ thời kỳ mới.',
            contactAddress: 'Quân khu 4, Nghệ An',
            contactEmail: 'contact@su324.vn',
            contactPhone: '069.xxxx.xxx',
            customCss: ''
        };
        updateSettings(defaults);
    }
  };

  return (
    <SiteContext.Provider value={{ settings, updateSettings, resetSettings, isLoading }}>
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
