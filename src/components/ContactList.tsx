
import React from 'react';
import { Users, Phone, Mail, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Contact } from '@/types/contact';

interface ContactListProps {
  contacts: Contact[];
}

const ContactList: React.FC<ContactListProps> = ({ contacts }) => {
  if (contacts.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contact List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No contacts uploaded yet</p>
            <p className="text-sm text-gray-400">Upload a CSV file to see your contacts here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contact List
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {contacts.length} contacts
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-1 p-6 pt-0">
            {contacts.slice(0, 50).map((contact, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {contact.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600 truncate">
                        {contact.phone}
                      </span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600 truncate">
                          {contact.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {contacts.length > 50 && (
              <div className="p-3 text-center text-sm text-gray-500 bg-gray-50 rounded-lg">
                And {contacts.length - 50} more contacts...
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ContactList;
