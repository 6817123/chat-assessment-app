'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { LanguageState } from '@/lib/types'

interface LanguageContextType extends LanguageState {
  toggleLanguage: () => void
  setLanguage: (lang: 'en' | 'ar') => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Comprehensive translations
const translations = {
  en: {
    // App
    'app.title': 'Chat Assessment',
    'app.subtitle': 'AI-Powered Assistant',
    'app.welcome': 'Welcome to Chat Assessment',
    
    // Navigation
    'nav.home': 'Home',
    'nav.settings': 'Settings',
    'nav.back': 'Back',
    'nav.close': 'Close',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.fontSize': 'Font Size',
    'settings.features': 'Features',
    'settings.general': 'General Settings',
    'settings.appearance': 'Appearance',
    'settings.save': 'Save Changes',
    'settings.reset': 'Reset to Default',
    
    // Theme options
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    
    // Font sizes
    'fontSize.small': 'Small',
    'fontSize.medium': 'Medium',
    'fontSize.large': 'Large',
    'fontSize.sm': 'Small',
    'fontSize.md': 'Medium',
    'fontSize.lg': 'Large',
    
    // Font families
    'settings.fontFamily': 'Font Family',
    'fontFamily.cairo': 'Cairo',
    'fontFamily.system': 'System Font',
    'fontFamily.arial': 'Arial',
    'fontFamily.times': 'Times New Roman',
    
    // Features
    'features.notifications': 'Notifications',
    'features.sounds': 'Sound Effects',
    'features.tts': 'Text-to-Speech',
    'features.thinking': 'Thinking Indicators',
    'features.animations': 'Animations',
    'features.autoSave': 'Auto Save',
    
    // Settings descriptions
    'settings.descriptions.theme': 'Choose your preferred appearance theme',
    'settings.descriptions.fontSize': 'Adjust text size for comfortable reading',
    'settings.descriptions.fontFamily': 'Choose your preferred font family',
    'settings.descriptions.features': 'Customize application features and behavior',
    'settings.descriptions.language.ltr': 'Left to Right',
    'settings.descriptions.language.rtl': 'Right to Left',
    'settings.descriptions.lightTheme': 'Bright theme with light colors',
    'settings.descriptions.darkTheme': 'Dark theme for reduced eye strain',
    'settings.descriptions.systemTheme': 'Follow your system preferences',
    'settings.descriptions.smallFont': 'Compact text size for more content',
    'settings.descriptions.mediumFont': 'Balanced text size for comfortable reading',
    'settings.descriptions.largeFont': 'Larger text size for better readability',
    'settings.descriptions.cairoFont': 'Cairo font for Arabic and multilingual support',
    'settings.descriptions.systemFont': 'Your system default font',
    'settings.descriptions.arialFont': 'Clean and modern Arial font',
    'settings.descriptions.timesFont': 'Classic Times New Roman font',
    'settings.descriptions.sounds': 'Enable sounds in the application',
    'settings.descriptions.tts': 'Automatically read assistant messages aloud',
    'settings.descriptions.thinking': 'Show thinking indicators and progress animations',
    'settings.descriptions.notifications': 'Enable notifications',
    'settings.descriptions.animations': 'Enable animations and transitions',
    'settings.descriptions.reset': 'Reset all settings to default values',
    'settings.descriptions.resetWarning': 'This will restore all settings to their original values',
    'settings.resetWarning': 'Dangerous Zone',
    'settings.resetConfirm': 'Are you sure you want to reset all settings?',
    'settings.resetAll': 'Reset All Settings',
    'settings.confirmReset': 'Are you sure you want to reset settings?',
    
    // Chat
    'chat.title': 'Chat',
    'chat.close': 'Close',
    'chat.send': 'Send',
    'chat.typing': 'Typing...',
    'chat.online': 'Online',
    'chat.offline': 'Offline',
    'chat.connected': 'Connected',
    'chat.disconnected': 'Disconnected',
    'chat.newMessage': 'New Message',
    'chat.confirm.delete': 'Are you sure you want to delete this conversation?',
    'chat.thinking': 'Assistant is thinking...',
    'chat.new': 'New conversation',
    'chat.history.empty': 'No conversations yet',
    'chat.history.start': 'Start your first conversation!',
    'chat.no.conversations': 'No conversations yet',
    'chat.start.conversation': 'Start your first conversation!',
    'chat.conversations': 'Conversations',
    'chat.conversations.count': 'conversations',
    
    // TTS
    'tts.speak': 'Speak message',
    'tts.stop': 'Stop speaking',
    'tts.speaking': 'Speaking...',
    
    // Error messages
    'error.fileUpload': 'File Upload Error',
    'error.networkFailure': 'Network Error',
    'error.unsupportedFile': 'Unsupported File Type',
    
    // Success messages
    'success.filesAdded': 'Files Added',
    'success.messageSent': 'Message Sent',
    
    // Status  
    'status.connected': 'Connected',
    'status.disconnected': 'Disconnected',
    
    // Conversations
    'conversations.title': 'Conversation History',
    'conversations.empty': 'No conversations',
    
    // Input
    'input.placeholder': 'Type your message...',
    'input.send': 'Send',
    'input.attachFile': 'Attach file',
    'input.dropFiles': 'Drop files here to upload',
    
    // Voice
    'voice.record': 'Record voice message',
    'voice.recording': 'Recording...',
    'voice.cancel': 'Cancel recording',
    'voice.send': 'Send recording',
    'voice.startRecording': 'Start Recording',
    'voice.pause': 'Pause',
    'voice.resume': 'Resume',
    'voice.stop': 'Stop',
    'voice.recordAgain': 'Record Again',
    'voice.readyToRecord': 'Ready to record',
    'voice.paused': 'Recording paused',
    'voice.recordingComplete': 'Recording complete',
    'voice.audioNotSupported': 'Your browser does not support audio playback',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    
    // Errors
    'error.network': 'Failed to connect to server',
    'error.loadUsers': 'Failed to load users',
    
    // Language
    'language.english': 'English',
    'language.arabic': 'العربية',
    'language.toggle': 'عربي',
    'language.select': 'Select Language',
    
    // Home Page
    'home.title': 'Welcome to Chat Assessment',
    'home.subtitle': 'A modern AI chat application with multilingual support',
    'home.features.multilingual.title': 'Multilingual Support',
    'home.features.multilingual.description': 'Chat in both English and Arabic with automatic RTL/LTR support',
    'home.features.ai.title': 'AI Assistant',
    'home.features.ai.description': 'Intelligent responses with file attachment support',
    'home.features.responsive.title': 'Responsive Design',
    'home.features.responsive.description': 'Optimized for desktop, tablet, and mobile devices',
    'home.features.attachments.title': 'File Attachments',
    'home.features.attachments.description': 'Share images, documents, and audio files seamlessly',
    'home.features.history.title': 'Conversation History',
    'home.features.history.description': 'All conversations saved locally for future reference',
    'home.features.theme.title': 'Dark/Light Themes',
    'home.features.theme.description': 'Toggle between dark and light modes for comfortable viewing',
    'home.cta': 'Click the chat icon in the bottom right to start messaging! 💬'
  },
  ar: {
    // App
    'app.title': 'تقييم الدردشة',
    'app.subtitle': 'مساعد ذكي مدعوم بالذكاء الاصطناعي',
    'app.welcome': 'مرحباً بك في تقييم الدردشة',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.settings': 'الإعدادات',
    'nav.back': 'رجوع',
    'nav.close': 'إغلاق',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.language': 'اللغة',
    'settings.theme': 'المظهر',
    'settings.fontSize': 'حجم الخط',
    'settings.features': 'الميزات',
    'settings.general': 'الإعدادات العامة',
    'settings.appearance': 'المظهر',
    'settings.save': 'حفظ التغييرات',
    'settings.reset': 'إعادة تعيين افتراضي',
    
    // Theme options
    'theme.light': 'فاتح',
    'theme.dark': 'داكن',
    'theme.system': 'النظام',
    
    // Font sizes
    'fontSize.small': 'صغير',
    'fontSize.medium': 'متوسط',
    'fontSize.large': 'كبير',
    'fontSize.sm': 'صغير',
    'fontSize.md': 'متوسط',
    'fontSize.lg': 'كبير',
    
    // Font families
"settings.fontFamily": "اختيار الخط",
"fontFamily.cairo": "خط Cairo",
"fontFamily.system": "خط النظام (افتراضي)",
"fontFamily.arial": "Arial",
"fontFamily.times": "Times New Roman",

    
    // Features
    'features.notifications': 'الإشعارات',
    'features.sounds': 'الأصوات',
    'features.tts': 'قراءة النص',
    'features.thinking': 'مؤشرات التفكير',
    'features.animations': 'الحركات',
    'features.autoSave': 'الحفظ التلقائي',
    
    // Settings descriptions
    'settings.descriptions.theme': 'اختر مظهر التطبيق المفضل لديك',
    'settings.descriptions.fontSize': 'تعديل حجم النص للقراءة المريحة',
    'settings.descriptions.fontFamily': 'اختر نوع الخط المفضل لديك',
    'settings.descriptions.features': 'تخصيص ميزات وسلوك التطبيق',
    'settings.descriptions.language.ltr': 'من اليسار إلى اليمين',
    'settings.descriptions.language.rtl': 'من اليمين إلى اليسار',
    'settings.descriptions.lightTheme': 'مظهر فاتح بألوان مشرقة',
    'settings.descriptions.darkTheme': 'مظهر داكن لتقليل إجهاد العين',
    'settings.descriptions.systemTheme': 'اتبع إعدادات النظام الخاص بك',
    'settings.descriptions.smallFont': 'حجم نص صغير لعرض محتوى أكثر',
    'settings.descriptions.mediumFont': 'حجم نص متوازن للقراءة المريحة',
    'settings.descriptions.largeFont': 'حجم نص كبير لقابلية قراءة أفضل',
"settings.descriptions.cairoFont": "خط Cairo الأنيق، مثالي للغة العربية ودعم النصوص متعددة اللغات.",
"settings.descriptions.systemFont": "الخط الافتراضي للنظام، يتبع إعدادات جهازك مباشرة.",
"settings.descriptions.arialFont": "خط Arial العصري والواضح، مناسب لواجهة نظيفة وسهلة القراءة.",
"settings.descriptions.timesFont": "خط Times New Roman الكلاسيكي والمألوف في المستندات الرسمية.",

    'settings.descriptions.sounds': 'تفعيل الأصوات فالتطبيق',
    'settings.descriptions.tts': 'قراءة رسائل المساعد بصوت عالٍ تلقائياً',
    'settings.descriptions.thinking': 'إظهار مؤشرات التفكير والحركات التقدمية',
    'settings.descriptions.notifications': 'تفعيل الإشعارات',
    'settings.descriptions.animations': 'تفعيل الحركات والانتقالات',
    'settings.descriptions.reset': 'إعادة تعيين جميع الإعدادات إلى القيم الافتراضية',
    'settings.descriptions.resetWarning': 'سيؤدي هذا إلى استعادة جميع الإعدادات إلى قيمها الأصلية',
    'settings.resetWarning': 'منطقة خطرة',
    'settings.resetConfirm': 'هل أنت متأكد من إعادة تعيين جميع الإعدادات؟',
    'settings.resetAll': 'إعادة تعيين جميع الإعدادات',
    'settings.confirmReset': 'هل أنت متأكد من إعادة تعيين الإعدادات؟',
    
    // Chat
    'chat.title': 'الدردشة',
    'chat.close': 'إغلاق',
    'chat.send': 'إرسال',
    'chat.typing': 'يكتب...',
    'chat.online': 'متصل',
    'chat.offline': 'غير متصل',
    'chat.connected': 'متصل',
    'chat.disconnected': 'منقطع',
    'chat.newMessage': 'رسالة جديدة',
    'chat.confirm.delete': 'هل أنت متأكد من حذف هذه المحادثة؟',
    'chat.thinking': 'المساعد يفكر...',
    'chat.new': 'محادثة جديدة',
    'chat.history.empty': 'لا توجد محادثات بعد',
    'chat.history.start': 'ابدأ محادثتك الأولى!',
    'chat.no.conversations': 'لا توجد محادثات بعد',
    'chat.start.conversation': 'ابدأ محادثتك الأولى!',
    'chat.conversations': 'المحادثات',
    'chat.conversations.count': 'محادثة',
    
    // TTS
    'tts.speak': 'تشغيل الرسالة',
    'tts.stop': 'إيقاف التشغيل',
    'tts.speaking': 'جارٍ التشغيل...',
    
    // Error messages
    'error.fileUpload': 'خطأ في رفع الملف',
    'error.networkFailure': 'خطأ في الشبكة',
    'error.unsupportedFile': 'نوع ملف غير مدعوم',
    
    // Success messages
    'success.filesAdded': 'تم إضافة الملفات',
    'success.messageSent': 'تم إرسال الرسالة',
    
    // Status  
    'status.connected': 'متصل',
    'status.disconnected': 'منقطع الاتصال',
    
    // Conversations
    'conversations.title': 'تاريخ المحادثات',
    'conversations.empty': 'لا توجد محادثات',
    
    // Input
    'input.placeholder': 'اكتب رسالتك...',
    'input.send': 'إرسال',
    'input.attachFile': 'إرفاق ملف',
    'input.dropFiles': 'اسحب الملفات هنا للتحميل',
    
    // Voice
    'voice.record': 'تسجيل رسالة صوتية',
    'voice.recording': 'يتم التسجيل...',
    'voice.cancel': 'إلغاء التسجيل',
    'voice.send': 'إرسال التسجيل',
    'voice.startRecording': 'بدء التسجيل',
    'voice.pause': 'إيقاف مؤقت',
    'voice.resume': 'استئناف',
    'voice.stop': 'إيقاف',
    'voice.recordAgain': 'إعادة التسجيل',
    'voice.readyToRecord': 'جاهز للتسجيل',
    'voice.paused': 'التسجيل متوقف مؤقتاً',
    'voice.recordingComplete': 'التسجيل مكتمل',
    'voice.audioNotSupported': 'المتصفح الخاص بك لا يدعم تشغيل الصوت',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.download': 'تحميل',
    
    // Errors
    'error.network': 'فشل الاتصال بالخادم',
    'error.loadUsers': 'فشل في تحميل المستخدمين',
    
    // Language
    'language.english': 'English',
    'language.arabic': 'العربية',
    'language.toggle': 'English',
    'language.select': 'اختر اللغة',
    
    // Home Page
    'home.title': 'مرحباً بك في تقييم الدردشة',
    'home.subtitle': 'تطبيق دردشة ذكي حديث بدعم متعدد اللغات',
    'home.features.multilingual.title': 'دعم متعدد اللغات',
    'home.features.multilingual.description': 'تحدث بالإنجليزية والعربية مع الدعم التلقائي لاتجاه الكتابة',
    'home.features.ai.title': 'مساعد ذكي',
    'home.features.ai.description': 'ردود ذكية مع دعم إرفاق الملفات',
    'home.features.responsive.title': 'تصميم متجاوب',
    'home.features.responsive.description': 'محسّن لأجهزة سطح المكتب والأجهزة اللوحية والهواتف المحمولة',
    'home.features.attachments.title': 'إرفاق الملفات',
    'home.features.attachments.description': 'شارك الصور والمستندات والملفات الصوتية بسلاسة',
    'home.features.history.title': 'تاريخ المحادثات',
    'home.features.history.description': 'جميع المحادثات محفوظة محلياً للرجوع إليها مستقبلاً',
    'home.features.theme.title': 'المظاهر الداكنة/الفاتحة',
    'home.features.theme.description': 'تبديل بين الأوضاع الداكنة والفاتحة لمشاهدة مريحة',
    'home.cta': 'انقر على أيقونة الدردشة في الأسفل لبدء المراسلة! 💬'
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'ar'>('en')
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('chat-language') as 'en' | 'ar' | null
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage)
      setDirection(savedLanguage === 'ar' ? 'rtl' : 'ltr')
    }
  }, [])

  useEffect(() => {
    document.documentElement.dir = direction
    document.documentElement.lang = language
    
    if (direction === 'rtl') {
      document.body.classList.add('rtl')
      document.body.classList.remove('ltr')
    } else {
      document.body.classList.add('ltr')
      document.body.classList.remove('rtl')
    }
  }, [language, direction])

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en'
    setLanguage(newLanguage)
  }

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang)
    setDirection(lang === 'ar' ? 'rtl' : 'ltr')
    localStorage.setItem('chat-language', lang)
    
    window.dispatchEvent(new Event('languageChanged'))
  }

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]]
    return translation || key
  }

  const value: LanguageContextType = {
    language,
    direction,
    toggleLanguage,
    setLanguage,
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}