import  { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, History, Shield, Zap } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'topup' | 'withdrawal';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  vendor?: string;
}

const WalletSystem = () => {
  const [balance] = useState(234.50);
  const [topupAmount, setTopupAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'payment',
      amount: -49.99,
      description: 'Logo Design Service - Creative Studios Inc',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'completed',
      vendor: 'Creative Studios Inc'
    },
    {
      id: '2',
      type: 'topup',
      amount: 100.00,
      description: 'Wallet Top-up via Credit Card',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: '3',
      type: 'payment',
      amount: -199.00,
      description: 'Wireless Bluetooth Headphones - TechGear Pro',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'completed',
      vendor: 'TechGear Pro'
    },
    {
      id: '4',
      type: 'refund',
      amount: 29.99,
      description: 'Refund for cancelled service',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'completed'
    }
  ]);

  const handleTopup = () => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) return;
    console.log('Processing top-up:', topupAmount);
    // Integrate with payment gateway
    setTopupAmount('');
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    console.log('Processing withdrawal:', withdrawAmount);
    // Process withdrawal
    setWithdrawAmount('');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'refund':
      case 'topup':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Finda Wallet</h2>
              </div>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
              <p className="text-blue-100 mt-1">Available Balance</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Instant Payments</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add Money
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setTopupAmount('25')}
                >
                  $25
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setTopupAmount('50')}
                >
                  $50
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setTopupAmount('100')}
                >
                  $100
                </Button>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={handleTopup}
                disabled={!topupAmount}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Add Money
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-blue-600" />
              Withdraw Money
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={balance}
              />
              <p className="text-sm text-gray-600">
                Available for withdrawal: ${balance.toFixed(2)}
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) > balance}
              >
                Withdraw to Bank
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="topups">Top-ups</TabsTrigger>
              <TabsTrigger value="refunds">Refunds</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                      {transaction.vendor && (
                        <p className="text-xs text-gray-500">Vendor: {transaction.vendor}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="payments">
              <div className="space-y-4">
                {transactions.filter(t => t.type === 'payment').map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        -${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="topups">
              <div className="space-y-4">
                {transactions.filter(t => t.type === 'topup').map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +${transaction.amount.toFixed(2)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="refunds">
              <div className="space-y-4">
                {transactions.filter(t => t.type === 'refund').map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +${transaction.amount.toFixed(2)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletSystem;