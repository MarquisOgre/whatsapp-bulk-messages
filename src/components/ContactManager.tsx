
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Contact } from '@/types/contact';
import { useAuth } from '@/hooks/useAuth';
import CsvUploader from './CsvUploader';
import ContactList from './ContactList';

interface ContactManagerProps {
  onContactsChange: (contacts: Contact[]) => void;
}

const ContactManager: React.FC<ContactManagerProps> = ({ onContactsChange }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedContacts = data?.map(contact => ({
        name: contact.name,
        phone: contact.phone,
        email: contact.email || ''
      })) || [];

      setContacts(formattedContacts);
      onContactsChange(formattedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleContactsUploaded = async (uploadedContacts: Contact[]) => {
    if (!user) return;
    
    try {
      // Insert contacts into database
      const contactsToInsert = uploadedContacts.map(contact => ({
        name: contact.name,
        phone: contact.phone,
        email: contact.email || null,
        user_id: user.id
      }));

      const { error } = await supabase
        .from('contacts')
        .insert(contactsToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${uploadedContacts.length} contacts uploaded and saved!`,
      });

      // Refresh contacts list
      fetchContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contacts to database",
        variant: "destructive",
      });
      console.error('Error saving contacts:', error);
    }
  };

  return (
    <div className="space-y-6">
      <CsvUploader onContactsUploaded={handleContactsUploaded} />
      <ContactList contacts={contacts} />
    </div>
  );
};

export default ContactManager;
