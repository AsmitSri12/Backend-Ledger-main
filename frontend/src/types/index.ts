export interface User {
  _id: string;
  email: string;
  name: string;
  role?: string;
}

export interface Account {
  _id: string;
  user: string;
  status: 'ACTIVE' | 'INACTIVE';
  currency: string;
  balance?: number;
}

export interface Transaction {
  _id: string;
  fromAccount: Account | string;
  toAccount: Account | string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface ErrorResponse {
  message: string;
  status?: string;
  error?: {
    statusCode: number;
    status: string;
  };
}
