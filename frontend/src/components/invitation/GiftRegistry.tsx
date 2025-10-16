'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      // Potentially use a toast notification here in a real app
      alert('Copied to clipboard!');
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Wedding Gift</CardTitle>
        <CardDescription>
          Your presence is the greatest gift, but if you wish to give something more, you can use the following accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account, index) => (
          <div key={index} className="p-4 bg-muted rounded-lg border text-center">
            <h4 className="font-bold text-lg text-card-foreground">{account.bankName}</h4>
            <p className="text-2xl my-2 font-mono text-primary">{account.accountNumber}</p>
            <p className="text-md mb-3 text-muted-foreground">a/n {account.accountHolder}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(account.accountNumber)}
            >
              Copy Account Number
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GiftRegistry;