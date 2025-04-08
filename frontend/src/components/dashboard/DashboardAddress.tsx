
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DashboardAddress = () => {
  const { user, profile, updateProfile, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [street, setStreet] = useState(profile?.address?.street || '');
  const [city, setCity] = useState(profile?.address?.city || '');
  const [state, setState] = useState(profile?.address?.state || '');
  const [zip, setZip] = useState(profile?.address?.zip || '');
  const [country, setCountry] = useState(profile?.address?.country || '');

  const handleUpdateAddress = async () => {
    try {
      await updateProfile({
        user: {
          id: user?.id || '',
          name: user?.name || '',
          email: user?.email || '',
        },
        address: {
          street,
          city,
          state,
          zip,
          country
        }
      });
      
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your address.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Address</h1>
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>
            Update your shipping address for deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input 
                id="street" 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input 
                  id="state" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip">Postal/Zip Code</Label>
                <Input 
                  id="zip" 
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
            
            <Button onClick={handleUpdateAddress} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Address'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardAddress;
