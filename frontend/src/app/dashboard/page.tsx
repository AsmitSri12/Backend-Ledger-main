'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAccountStore } from '@/store/accountStore';
import api from '@/services/api';
import { Account } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { accounts, setAccounts, addAccount, removeAccount } = useAccountStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (hasFetched && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hasFetched, isAuthenticated, router]);

useEffect(() => {
    let isMounted = true;
    let cancelled = false;
    
    const fetchAccounts = async () => {
      if (cancelled || !isMounted) return;
      try {
        const response = await api.get('/accounts');
        if (!cancelled && isMounted) {
          setAccounts(response.data.accounts as Account[]);
        }
      } catch (error: unknown) {
        if (!cancelled && isMounted) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 401) {
            cancelled = true;
            router.replace('/login');
            return;
          }
          console.error('Failed to fetch accounts', error);
        }
      } finally {
        if (isMounted && !cancelled) {
          setIsLoading(false);
          setHasFetched(true);
        }
      }
    };
    
    fetchAccounts();
    
    return () => {
      isMounted = false;
      cancelled = true;
    };
  }, [router, setAccounts]);

  const handleCreateAccount = async () => {
    try {
      setIsCreating(true);
      const res = await api.post('/accounts');
      addAccount(res.data.account as Account);
    } catch (error) {
      console.error('Error creating account', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account? This will permanently delete all associated transactions.')) {
      return;
    }
    try {
      setDeletingId(accountId);
      await api.delete(`/accounts/${accountId}`);
      removeAccount(accountId);
    } catch (error) {
      console.error('Error deleting account', error);
      alert('Failed to delete account');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <button
          onClick={handleCreateAccount}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : '+ New Account'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">You don&apos;t have any accounts yet.</p>
            <button
              onClick={handleCreateAccount}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first account
            </button>
          </div>
        ) : (
          accounts.map((account: Account) => (
            <div key={account._id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                    Account
                  </h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {account.status}
                  </span>
                </div>
                <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                  <div className="max-w-xl text-sm text-gray-500">
                    <p>ID: <span className="font-mono text-xs">{account._id}</span></p>
                    <p>Currency: {account.currency}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <Link href={`/dashboard/account/${account._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View Details & Balance
                  </Link>
                  <button
                    onClick={() => handleDeleteAccount(account._id)}
                    disabled={deletingId === account._id}
                    className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                  >
                    {deletingId === account._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
