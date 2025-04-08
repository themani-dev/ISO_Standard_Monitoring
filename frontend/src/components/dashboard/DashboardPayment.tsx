
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DashboardPayment = () => {
  const { profile, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleAddPaymentMethod = async () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast({
        title: "Missing information",
        description: "Please fill in all payment details.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    
    toast({
      title: "Payment method added",
      description: "Your new payment method has been saved.",
    });
  };

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Payment Methods</h1>
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Payment Methods</h3>
              
              {profile?.paymentMethods && profile.paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {profile.paymentMethods.map(method => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{method.cardType} •••• {method.lastFour}</p>
                          <p className="text-sm text-muted-foreground">Expires {method.expiryDate}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No payment methods added yet</p>
              )}
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Add New Payment Method</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input 
                    id="cardNumber" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input 
                    id="cardName" 
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input 
                      id="expiryDate" 
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      id="cvv" 
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleAddPaymentMethod} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Payment Method'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardPayment;
