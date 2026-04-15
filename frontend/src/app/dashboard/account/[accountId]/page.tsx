'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useParams, useRouter } from 'next/navigation';
import { Transaction, Account } from '@/types';

interface AccountDetails {
  balance: number;
}

export default function AccountDetailsPage() {
  const { accountId } = useParams();
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, txnsRes] = await Promise.all([
          api.get(`/accounts/balance/${accountId}`),
          api.get('/transactions')
        ]);
        setBalance((balanceRes.data as AccountDetails).balance);
        
        const allTransactions = txnsRes.data.transactions as Transaction[];
        const accTxns = allTransactions.filter((t: Transaction) => {
          const fromId = typeof t.fromAccount === 'string' ? t.fromAccount : t.fromAccount._id;
          const toId = typeof t.toAccount === 'string' ? t.toAccount : t.toAccount._id;
          return fromId === accountId || toId === accountId;
        });
        setTransactions(accTxns);
      } catch (error) {
        console.error('Failed to fetch account details', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (accountId) fetchData();
  }, [accountId]);

  const getAccountId = (account: Account | string): string => {
    return typeof account === 'string' ? account : account._id;
  };

  if (isLoading) return <div className="p-8 text-center bg-gray-50 min-h-screen">Loading details...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        &larr; Back to Dashboard
      </button>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Account ID</p>
            <p className="mt-1 text-lg font-mono text-gray-900">{accountId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Available Balance</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">
              {balance !== null ? balance.toFixed(2) : '---'}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Ledger Entries (Recent Transactions)</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No transactions found for this account.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map((txn: Transaction) => {
              const fromId = getAccountId(txn.fromAccount);
              const isDebit = fromId === accountId;
              return (
                <li key={txn._id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {isDebit ? 'Transfer to' : 'Transfer from'} <span className="font-mono">{isDebit ? getAccountId(txn.toAccount) : fromId}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(txn.createdAt).toLocaleString()}</p>
                  </div>
                  <div className={`text-lg font-bold ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                    {isDebit ? '-' : '+'}{txn.amount}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
