
import React, { useState } from 'react';
import { Upload, MessageCircle, Download, Users, Send, LogOut, Settings } from 'lucide-react';
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

    setIsLoading(true);
    
    try {
      // Create message record
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          content: message,
          status: 'sending'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Get contacts from database
      const { data: dbContacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*');

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              WhatsApp Bulk Messenger
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Send personalized WhatsApp messages to up to 1000 contacts at once. Upload your CSV file and reach your audience instantly.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                  <p className="text-sm text-muted-foreground">Contacts Loaded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{message.length}</p>
                  <p className="text-sm text-muted-foreground">Characters</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Send className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">1000</p>
                  <p className="text-sm text-muted-foreground">Max Recipients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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

            {/* Send Button */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg">
              <CardContent className="p-6">
                <Button 
                  onClick={handleSendMessages}
                  disabled={isLoading || contacts.length === 0 || !message.trim() || !isWhatsAppConnected}
                  className="w-full bg-white text-blue-600 hover:bg-gray-50 font-semibold py-6 text-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                      Sending Messages...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send to {contacts.length} Contacts
                    </>
                  )}
                </Button>
                {!isWhatsAppConnected && contacts.length > 0 && message.trim() && (
                  <p className="text-white/80 text-sm mt-2 text-center">
                    Please connect your WhatsApp Business account first
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
