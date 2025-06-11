
import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Contact } from '@/types/contact';

interface CsvUploaderProps {
  onContactsUploaded: (contacts: Contact[]) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onContactsUploaded }) => {
  const { toast } = useToast();

  const parseCSV = (text: string): Contact[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const phoneIndex = headers.findIndex(h => h.includes('phone'));
    const emailIndex = headers.findIndex(h => h.includes('email'));

    if (nameIndex === -1 || phoneIndex === -1) {
      throw new Error('CSV must contain Name and Phone columns');
    }

    const contacts: Contact[] = [];
    for (let i = 1; i < lines.length && contacts.length < 1000; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= Math.max(nameIndex, phoneIndex) + 1) {
        const contact: Contact = {
          name: values[nameIndex] || '',
          phone: values[phoneIndex] || '',
          email: emailIndex >= 0 ? values[emailIndex] || '' : ''
        };

        if (contact.name && contact.phone) {
          contacts.push(contact);
        }
      }
    }

    return contacts;
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const contacts = parseCSV(text);
        
        if (contacts.length === 0) {
          toast({
            title: "No Valid Contacts",
            description: "No valid contacts found in the CSV file",
            variant: "destructive",
          });
          return;
        }

        onContactsUploaded(contacts);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast({
          title: "Parse Error",
          description: error instanceof Error ? error.message : "Failed to parse CSV file",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, [onContactsUploaded, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      // Create a proper event object
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(csvFile);
      input.files = dataTransfer.files;
      
      const event = {
        target: input,
        currentTarget: input
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileUpload(event);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload CSV File
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <label htmlFor="csv-upload" className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </label>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">CSV Format Requirements:</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• Must include "Name" and "Phone" columns</li>
              <li>• Optional "Email" column</li>
              <li>• Maximum 1000 contacts</li>
              <li>• File size limit: 5MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvUploader;
