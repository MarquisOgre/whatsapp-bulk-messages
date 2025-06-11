
-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create message_sends table to track individual message sends
CREATE TABLE public.message_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages NOT NULL,
  contact_id UUID REFERENCES public.contacts NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  whatsapp_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create whatsapp_connections table
CREATE TABLE public.whatsapp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  phone_number TEXT NOT NULL,
  business_account_id TEXT,
  access_token_encrypted TEXT,
  webhook_verify_token TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected', -- connected, disconnected, pending
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, phone_number)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
CREATE POLICY "Users can manage their own contacts" 
  ON public.contacts 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can manage their own messages" 
  ON public.messages 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for message_sends
CREATE POLICY "Users can view their own message sends" 
  ON public.message_sends 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.messages 
      WHERE messages.id = message_sends.message_id 
      AND messages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own message sends" 
  ON public.message_sends 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages 
      WHERE messages.id = message_sends.message_id 
      AND messages.user_id = auth.uid()
    )
  );

-- Create RLS policies for whatsapp_connections
CREATE POLICY "Users can manage their own WhatsApp connections" 
  ON public.whatsapp_connections 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_message_sends_message_id ON public.message_sends(message_id);
CREATE INDEX idx_message_sends_contact_id ON public.message_sends(contact_id);
CREATE INDEX idx_whatsapp_connections_user_id ON public.whatsapp_connections(user_id);
