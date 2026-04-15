import { create } from 'zustand';

interface Account {
  _id: string;
  user: string;
  status: string;
  currency: string;
  balance?: number;
}

interface AccountState {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  removeAccount: (accountId: string) => void;
  updateBalance: (accountId: string, balance: number) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
  removeAccount: (accountId) => set((state) => ({ accounts: state.accounts.filter((acc) => acc._id !== accountId) })),
  updateBalance: (accountId, balance) =>
    set((state) => ({
      accounts: state.accounts.map((acc) =>
        acc._id === accountId ? { ...acc, balance } : acc
      ),
    })),
}));
