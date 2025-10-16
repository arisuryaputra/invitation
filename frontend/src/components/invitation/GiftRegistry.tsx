'use client';

import React from 'react';

interface Account {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface GiftRegistryProps {
  accounts?: Account[];
}

const defaultAccounts: Account[] = [
  {
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '1234567890',
    accountHolder: 'John Doe',
  },
  {
    bankName: 'GoPay E-Wallet',
    accountNumber: '081234567890',
    accountHolder: 'Jane Doe',
  },
];

const GiftRegistry: React.FC<GiftRegistryProps> = ({ accounts = defaultAccounts }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  return (
    <div className="p-4 rounded-lg shadow-md bg-white text-gray-800 w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-center mb-4">Wedding Gift</h3>
      <p className="text-center text-gray-600 mb-6">
        Your presence is the greatest gift, but if you wish to give something more,
        you can use the following accounts.
      </p>
      <div className="space-y-4">
        {accounts.map((account, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <h4 className="font-bold text-lg">{account.bankName}</h4>
            <p className="text-2xl my-2">{account.accountNumber}</p>
            <p className="text-md mb-3">a/n {account.accountHolder}</p>
            <button
              onClick={() => handleCopy(account.accountNumber)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none"
            >
              Copy Account Number
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GiftRegistry;