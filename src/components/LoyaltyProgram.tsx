import  { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Crown, Star, Trophy, Zap, Calendar, ShoppingBag, Target } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'freebie' | 'premium' | 'exclusive';
  value: string;
  available: boolean;
  expiresAt?: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  progress: number;
  maxProgress: number;
  pointsReward: number;
}

const LoyaltyProgram = () => {
  const [currentPoints] = useState(2450);
  const [currentTier] = useState('Gold');
  const [nextTier] = useState('Platinum');
  const [pointsToNextTier] = useState(550);

  const tierLevels = {
    Bronze: { min: 0, max: 1000, color: 'bg-amber-600', benefits: ['5% cashback', 'Priority support'] },
    Silver: { min: 1000, max: 2000, color: 'bg-gray-400', benefits: ['10% cashback', 'Early access', 'Free shipping'] },
    Gold: { min: 2000, max: 3000, color: 'bg-yellow-500', benefits: ['15% cashback', 'Premium support', 'Exclusive deals'] },
    Platinum: { min: 3000, max: 5000, color: 'bg-purple-600', benefits: ['20% cashback', 'Personal shopper', 'VIP events'] },
    Diamond: { min: 5000, max: Infinity, color: 'bg-blue-600', benefits: ['25% cashback', 'Concierge service', 'Custom rewards'] }
  };

  const rewards: Reward[] = [
    {
      id: '1',
      title: '$10 Off Next Purchase',
      description: 'Get $10 off your next order of $50 or more',
      pointsCost: 500,
      category: 'discount',
      value: '$10',
      available: true
    },
    {
      id: '2',
      title: 'Free Premium Support',
      description: '30 days of priority customer support',
      pointsCost: 800,
      category: 'premium',
      value: '$25 value',
      available: true
    },
    {
      id: '3',
      title: 'Exclusive Design Consultation',
      description: '1-hour free consultation with top-rated designer',
      pointsCost: 1200,
      category: 'exclusive',
      value: '$100 value',
      available: true
    },
    {
      id: '4',
      title: 'Free Listing Promotion',
      description: 'Boost your listing for 7 days',
      pointsCost: 1000,
      category: 'freebie',
      value: '$50 value',
      available: true
    },
    {
      id: '5',
      title: 'VIP Event Access',
      description: 'Exclusive access to vendor networking events',
      pointsCost: 2000,
      category: 'exclusive',
      value: 'Priceless',
      available: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Purchase',
      description: 'Make your first purchase on Finda',
      icon: ShoppingBag,
      completed: true,
      progress: 1,
      maxProgress: 1,
      pointsReward: 100
    },
    {
      id: '2',
      title: 'Loyal Customer',
      description: 'Make 10 purchases',
      icon: Target,
      completed: true,
      progress: 10,
      maxProgress: 10,
      pointsReward: 500
    },
    {
      id: '3',
      title: 'Review Master',
      description: 'Leave 25 reviews',
      icon: Star,
      completed: false,
      progress: 18,
      maxProgress: 25,
      pointsReward: 300
    },
    {
      id: '4',
      title: 'Referral Champion',
      description: 'Refer 5 friends',
      icon: Crown,
      completed: false,
      progress: 3,
      maxProgress: 5,
      pointsReward: 1000
    },
    {
      id: '5',
      title: 'Big Spender',
      description: 'Spend $1000 total',
      icon: Trophy,
      completed: false,
      progress: 750,
      maxProgress: 1000,
      pointsReward: 750
    }
  ];

  const recentActivity = [
    { date: '2 days ago', action: 'Earned 150 points', details: 'Purchase: Logo Design Service' },
    { date: '1 week ago', action: 'Redeemed reward', details: '$10 Off Next Purchase' },
    { date: '2 weeks ago', action: 'Earned 200 points', details: 'Purchase: Web Development' },
    { date: '3 weeks ago', action: 'Achievement unlocked', details: 'Loyal Customer (+500 points)' }
  ];

  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && reward.available && currentPoints >= reward.pointsCost) {
      console.log('Redeeming reward:', reward.title);
      // Handle reward redemption
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return '💰';
      case 'freebie': return '🎁';
      case 'premium': return '⭐';
      case 'exclusive': return '👑';
      default: return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'bg-green-100 text-green-800';
      case 'freebie': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'exclusive': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tierProgress = ((currentPoints - tierLevels[currentTier as keyof typeof tierLevels].min) / 
    (tierLevels[currentTier as keyof typeof tierLevels].max - tierLevels[currentTier as keyof typeof tierLevels].min)) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Finda Rewards</h1>
        <p className="text-gray-600">Earn points, unlock rewards, and enjoy exclusive benefits</p>
      </div>

      {/* Points & Tier Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-blue-600" />
              Your Rewards Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{currentPoints.toLocaleString()} Points</h3>
                  <p className="text-gray-600">Available to redeem</p>
                </div>
                <div className="text-right">
                  <Badge className={`${tierLevels[currentTier as keyof typeof tierLevels].color} text-white text-lg px-4 py-2`}>
                    <Crown className="h-4 w-4 mr-2" />
                    {currentTier}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress to {nextTier}</span>
                  <span className="text-sm font-medium">{pointsToNextTier} points to go</span>
                </div>
                <Progress value={tierProgress} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tierLevels[currentTier as keyof typeof tierLevels].benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold">+450 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Earned</span>
                <span className="font-semibold">8,750 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Redeemed</span>
                <span className="font-semibold">6,300 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="font-semibold">Jan 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className={`${!reward.available ? 'opacity-50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-2xl">{getCategoryIcon(reward.category)}</div>
                    <Badge className={getCategoryColor(reward.category)}>
                      {reward.category}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{reward.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-blue-600">{reward.pointsCost} pts</span>
                    <span className="text-sm text-gray-500">{reward.value}</span>
                  </div>

                  {reward.expiresAt && (
                    <p className="text-xs text-red-600 mb-2">
                      Expires: {reward.expiresAt.toLocaleDateString()}
                    </p>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => handleRedeemReward(reward.id)}
                    disabled={!reward.available || currentPoints < reward.pointsCost}
                  >
                    {currentPoints < reward.pointsCost ? 'Insufficient Points' : 'Redeem'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      achievement.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <achievement.icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <div className="flex items-center gap-2">
                          {achievement.completed && (
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          )}
                          <span className="text-sm font-medium text-blue-600">
                            +{achievement.pointsReward} pts
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="flex-1 h-2" 
                        />
                        <span className="text-sm text-gray-500">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoyaltyProgram;