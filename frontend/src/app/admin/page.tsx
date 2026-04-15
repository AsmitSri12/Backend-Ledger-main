'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface AdminInsights {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    try {
      const [insightsRes, usersRes] = await Promise.all([
        api.get('/admin/insights'),
        api.get('/admin/users')
      ]);
      setInsights(insightsRes.data.insights as AdminInsights);
      setUsers(usersRes.data.users as User[]);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    } else if (user && user.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [user, router, fetchAdminData]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">System Admin Panel</h1>
        
        {isLoading ? (
          <div className="text-center">Loading insights...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 shadow rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-500">Total Users</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{insights?.totalUsers}</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-500">Total Accounts</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{insights?.totalAccounts}</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-500">Total Transactions</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{insights?.totalTransactions}</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">All Users</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {users.map((u) => (
                  <li key={u._id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                      {u.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
