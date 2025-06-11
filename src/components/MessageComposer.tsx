
import React from 'react';
import { MessageCircle, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MessageComposerProps {
  message: string;
  onMessageChange: (message: string) => void;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ message, onMessageChange }) => {
  const maxLength = 1000;
  const samplePreview = message.replace('{name}', 'John Doe').replace('{email}', 'john@example.com');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Your Message
        </label>
        <Textarea
          placeholder="Hi {name}, this is a personalized message for you! We hope you're doing well."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="min-h-[120px] resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400"
          maxLength={maxLength}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Use {'{name}'} and {'{email}'} for personalization</span>
          <span>{message.length}/{maxLength}</span>
        </div>
      </div>

      {message && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Message Preview
            </CardTitle>
            <CardDescription className="text-xs">
              How your message will appear to recipients
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-green-100 rounded-lg rounded-tl-none p-3 max-w-xs">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {samplePreview || 'Your message will appear here...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Available Variables:</h4>
          <div className="space-y-1 text-gray-600">
            <p><code className="bg-gray-100 px-2 py-1 rounded text-xs">{'{name}'}</code> - Contact's name</p>
            <p><code className="bg-gray-100 px-2 py-1 rounded text-xs">{'{email}'}</code> - Contact's email</p>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Tips:</h4>
          <div className="space-y-1 text-gray-600 text-xs">
            <p>• Keep messages under 1000 characters</p>
            <p>• Personalize with variables for better engagement</p>
            <p>• Preview your message before sending</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;
