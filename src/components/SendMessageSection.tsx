
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface SendMessageSectionProps {
  onSendMessages: () => void;
  isLoading: boolean;
  contactsCount: number;
  hasMessage: boolean;
  isWhatsAppConnected: boolean;
}

const SendMessageSection: React.FC<SendMessageSectionProps> = ({
  onSendMessages,
  isLoading,
  contactsCount,
  hasMessage,
  isWhatsAppConnected
}) => {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg">
      <CardContent className="p-6">
        <Button 
          onClick={onSendMessages}
          disabled={isLoading || contactsCount === 0 || !hasMessage || !isWhatsAppConnected}
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
              Send to {contactsCount} Contacts
            </>
          )}
        </Button>
        {!isWhatsAppConnected && contactsCount > 0 && hasMessage && (
          <p className="text-white/80 text-sm mt-2 text-center">
            Please connect your WhatsApp Business account first
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SendMessageSection;
