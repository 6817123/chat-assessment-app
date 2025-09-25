'use client'

import { useState, useEffect } from 'react'
import { userApi } from '@/lib/api'
import { useLanguage } from '@/contexts/SimpleLanguageContext'
import type { User } from '@/types'
import Image from 'next/image'
import { UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

interface UserSelectionProps {
  onUserSelect: (user: User) => void
}

export default function UserSelection({ onUserSelect }: UserSelectionProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language, direction, toggleLanguage, t } = useLanguage()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userApi.getUsers()
      
      if (response.success) {
        setUsers(response.data)
      } else {
        setError(response.message || t('error.loadUsers'))
      }
    } catch (err) {
      setError(t('error.network'))
      console.error('Load users error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    onUserSelect(user)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {t('common.error')}
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="w-full max-w-4xl">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <GlobeAltIcon className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {t('language.toggle')}
            </span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {t('user.select.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('user.select.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className="group relative bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.displayName}
                        width={64}
                        height={64}
                        className="rounded-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      user.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {user.displayName}
                    </h3>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {user.isOnline ? (
                        <span className="text-green-500 flex items-center justify-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          {t('common.online')}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          {t('common.offline')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <p className="text-gray-500 mb-4">No users found</p>
              <button
                onClick={loadUsers}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Select a user to start your chat experience</p>
          </div>
        </div>
      </div>
    </div>
  )
}