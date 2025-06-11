import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface WhatsAppConnectionProps {
  onConnectionChange: (isConnected: boolean) => void;
}

const WhatsAppConnection: React.FC<WhatsAppConnectionProps> = ({ onConnectionChange }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
      
      const hasActiveConnection = data?.some(conn => conn.status === 'connected');
      onConnectionChange(hasActiveConnection);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      // In a real implementation, you would validate the WhatsApp Business API credentials here
      const { error } = await supabase
        .from('whatsapp_connections')
        .insert({
          phone_number: phoneNumber,
          business_account_id: businessAccountId,
          access_token_encrypted: accessToken, // In production, encrypt this
          status: 'connected',
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "WhatsApp Business account connected successfully!",
      });

      setPhoneNumber('');
      setBusinessAccountId('');
      setAccessToken('');
      fetchConnections();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({ status: 'disconnected' })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "WhatsApp connection disconnected",
      });

      fetchConnections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect WhatsApp",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Connect WhatsApp Business
          </CardTitle>
          <CardDescription>
            Connect your WhatsApp Business API to send messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Business Account ID
              </label>
              <Input
                placeholder="Your WhatsApp Business Account ID"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Access Token
              </label>
              <Input
                type="password"
                placeholder="Your WhatsApp Business API Access Token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Connecting...' : 'Connect WhatsApp'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">How to get your credentials:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Sign up for WhatsApp Business Platform</li>
              <li>2. Create a Business App in Meta for Developers</li>
              <li>3. Get your Phone Number ID and Access Token</li>
              <li>4. Set up webhooks for message delivery status</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your WhatsApp Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{connection.phone_number}</p>
                      <p className="text-xs text-gray-500">
                        Connected {new Date(connection.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(connection.status)}>
                      {getStatusIcon(connection.status)}
                      {connection.status}
                    </Badge>
                    {connection.status === 'connected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(connection.id)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppConnection;
