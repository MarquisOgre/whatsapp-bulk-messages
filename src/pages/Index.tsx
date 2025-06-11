
import React, { useState } from 'react';
import { Upload, MessageCircle, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Auth from '@/components/Auth';
import MessageComposer from '@/components/MessageComposer';
import ContactManager from '@/components/ContactManager';
import WhatsAppConnection from '@/components/WhatsAppConnection';
import AppHeader from '@/components/AppHeader';
import StatsCards from '@/components/StatsCards';
import SendMessageSection from '@/components/SendMessageSection';
import { Contact } from '@/types/contact';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const { toast } = useToast();

  const handleSendMessages = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    if (contacts.length === 0) {
      toast({
        title: "Error",
        description: "Please upload contacts first",
        variant: "destructive",
      });
      return;
    }

    if (!isWhatsAppConnected) {
      toast({
        title: "Error",
        description: "Please connect your WhatsApp Business account first",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsLoading(true);
    
    try {
      // Create message record
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          content: message,
          status: 'sending',
          user_id: user.id
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Get contacts from database
      const { data: dbContacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      // Create message send records
      const messageSends = dbContacts?.map(contact => ({
        message_id: messageData.id,
        contact_id: contact.id,
        status: 'pending'
      })) || [];

      const { error: sendsError } = await supabase
        .from('message_sends')
        .insert(messageSends);

      if (sendsError) throw sendsError;

      // Simulate sending messages (in production, this would call WhatsApp API)
      for (let i = 0; i < contacts.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const personalizedMessage = message
          .replace('{name}', contacts[i].name)
          .replace('{email}', contacts[i].email);
        console.log(`Sending to ${contacts[i].name} (${contacts[i].phone}): ${personalizedMessage}`);
      }
      
      // Update message status
      await supabase
        .from('messages')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', messageData.id);

      toast({
        title: "Success",
        description: `Messages sent to ${contacts.length} contacts!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send messages. Please try again.",
        variant: "destructive",
      });
      console.error('Error sending messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDemoCSV = () => {
    const demoData = [
      ['Name', 'Phone', 'Email'],
      ['John Doe', '+1234567890', 'john@example.com'],
      ['Jane Smith', '+1987654321', 'jane@example.com'],
      ['Mike Johnson', '+1122334455', 'mike@example.com'],
      ['Sarah Wilson', '+1555666777', 'sarah@example.com'],
      ['David Brown', '+1999888777', 'david@example.com']
    ];

    const csvContent = demoData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-contacts.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Demo CSV file downloaded successfully!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <AppHeader userEmail={user.email || ''} onSignOut={signOut} />
        <StatsCards contactsCount={contacts.length} messageLength={message.length} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Compose */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Contacts
                </TabsTrigger>
                <TabsTrigger value="compose" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  WhatsApp
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Manage Contacts
                    </CardTitle>
                    <CardDescription>
                      Upload a CSV file with Name, Phone, and Email columns. Maximum 1000 contacts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContactManager onContactsChange={setContacts} />
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        onClick={downloadDemoCSV}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Demo CSV Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compose" className="mt-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Compose Your Message
                    </CardTitle>
                    <CardDescription>
                      Write your message. You can use variables like {'{name}'} for personalization.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MessageComposer message={message} onMessageChange={setMessage} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="whatsapp" className="mt-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      WhatsApp Business Setup
                    </CardTitle>
                    <CardDescription>
                      Connect your WhatsApp Business API to send messages.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WhatsAppConnection onConnectionChange={setIsWhatsAppConnected} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <SendMessageSection
              onSendMessages={handleSendMessages}
              isLoading={isLoading}
              contactsCount={contacts.length}
              hasMessage={message.trim().length > 0}
              isWhatsAppConnected={isWhatsAppConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
