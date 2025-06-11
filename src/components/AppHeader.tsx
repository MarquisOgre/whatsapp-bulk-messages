
import React from 'react';
import { MessageCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  userEmail: string;
  onSignOut: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ userEmail, onSignOut }) => {
  return (
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
        <span className="text-sm text-gray-600">{userEmail}</span>
        <Button variant="outline" onClick={onSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AppHeader;
