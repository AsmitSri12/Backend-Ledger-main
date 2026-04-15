'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import { useAccountStore } from '@/store/accountStore';
import { Transaction, Account, ErrorResponse } from '@/types';

const transactionSchema = z.object({
  fromAccount: z.string().min(1, 'From account is required'),
  toAccount: z.string().min(1, 'To account is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  idempotencyKey: z.string().default(() => Math.random().toString(36).substring(7)),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { accounts } = useAccountStore();

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      idempotencyKey: Math.random().toString(36).substring(7)
    }
  });

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.transactions as Transaction[]);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      setIsSubmitting(true);
      setServerError('');
      setSuccessMsg('');
      await api.post('/transactions', data);
      setSuccessMsg('Transaction completed successfully!');
      reset();
      setValue('idempotencyKey', Math.random().toString(36).substring(7));
      fetchTransactions();
    } catch (error) {
      const err = error as ErrorResponse;
      setServerError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccountId = (account: Account | string): string => {
    return typeof account === 'string' ? account : account._id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Transactions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-4">New Transaction</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{serverError}</div>}
                {successMsg && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{successMsg}</div>}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                  <select
                    {...register('fromAccount')}
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                  >
                    <option value="">Select Account</option>
                    {accounts.filter((a: Account) => a.status === 'ACTIVE').map((acc: Account) => (
                      <option key={acc._id} value={acc._id}>{acc._id} ({acc.currency})</option>
                    ))}
                  </select>
                  {errors.fromAccount && <p className="mt-1 text-sm text-red-500">{errors.fromAccount.message}</p>}
                </div>

                <Input
                  label="To Account ID"
                  type="text"
                  placeholder="Paste Recipient Account ID"
                  {...register('toAccount')}
                  error={errors.toAccount?.message}
                />

                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  {...register('amount')}
                  error={errors.amount?.message}
                />

                <input type="hidden" {...register('idempotencyKey')} />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Send Funds'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction History</h3>
              </div>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading history...</div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border-t border-gray-100">
                  No transactions found.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {transactions.map((txn: Transaction) => {
                    const fromId = getAccountId(txn.fromAccount);
                    const toId = getAccountId(txn.toAccount);
                    const isSender = accounts.some((a: Account) => a._id === fromId);
                    return (
                      <li key={txn._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {isSender ? 'Sent to' : 'Received from'} {isSender ? toId : fromId}
                            </p>
                            <p className="flex flex-col sm:flex-row mt-1 sm:items-center text-xs text-gray-500">
                              <span>Status: <span className={`font-semibold ${txn.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>{txn.status}</span></span>
                              <span className="hidden sm:inline sm:mx-2">&middot;</span>
                              <span>{new Date(txn.createdAt).toLocaleString()}</span>
                            </p>
                          </div>
                          <div className={`text-sm font-bold ${isSender ? 'text-red-600' : 'text-green-600'}`}>
                            {isSender ? '-' : '+'}{txn.amount}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
