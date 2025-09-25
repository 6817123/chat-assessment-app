'use client'

import { MainLayout } from '@/components/MainLayout'
import NewChatWidget from '@/components/NewChatWidget'
import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { cn } from '@/lib/utils'

export default function Home() {
  const { t, direction } = useLanguage()
  
  return (
    <MainLayout>
      <div className={cn(
        "min-h-screen flex items-center justify-center px-4 py-8 sm:py-16 lg:py-20",
        direction === 'rtl' && 'rtl'
      )}>
        <div className="w-full max-w-7xl mx-auto">
          <div className={cn(
            "text-center mb-8 sm:mb-12 lg:mb-16",
            direction === 'rtl' && 'text-right sm:text-center'
          )}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>
          
          <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8",
            direction === 'rtl' && 'rtl:space-x-reverse'
          )}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🌐</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {t('home.features.multilingual.title')}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.features.multilingual.description')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🤖</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {t('home.features.ai.title')}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.features.ai.description')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📱</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {t('home.features.responsive.title')}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.features.responsive.description')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📎</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {t('home.features.attachments.title')}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.features.attachments.description')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">💾</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {t('home.features.history.title')}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.features.history.description')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🎨</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {t('home.features.theme.title')}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.features.theme.description')}
              </p>
            </div>
          </div>
          
          <div className={cn(
            "text-center mt-12 sm:mt-16 lg:mt-20",
            direction === 'rtl' && 'text-right sm:text-center'
          )}>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg">
              <p className="text-sm sm:text-base lg:text-lg font-medium">
                {t('home.cta')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <NewChatWidget />
    </MainLayout>
  )
}