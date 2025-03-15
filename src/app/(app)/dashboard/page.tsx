'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/schemas/acceptmessageSchema';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: { acceptMessage: false },
  });

  const { register, watch, setValue } = form;
  const acceptMessage = watch('acceptMessage');

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
  };

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const { data } = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessage', data.isAcceptingMessages);
    } catch (error) {
      toast.error('Failed to fetch message settings');
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (refresh = false) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(data.messages || []);
      if (refresh) toast.success('Messages refreshed!');
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchMessages, fetchAcceptMessages]);

  const handleSwitchChange = async () => {
    try {
      const { data } = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessage,
      });
      setValue('acceptMessage', !acceptMessage);
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed to update message settings');
    }
  };

  if (!session || !session.user) return null;
  const { username } = session.user as User;
  const profileUrl = `${window.location.origin}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL copied!');
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input type="text" value={profileUrl} disabled className="input input-bordered w-full p-2 mr-2" />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>
      <div className="mb-4">
        <Switch
          {...register('acceptMessage')}
          checked={acceptMessage}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">Accept Messages: {acceptMessage ? 'On' : 'Off'}</span>
      </div>
      <Separator />
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard key={message._id} message={message} onMessageDelete={handleDeleteMessage} />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;