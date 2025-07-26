import { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Card } from '@/components/ui/card';
import { Database, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  summary?: string;
  table?: Record<string, any>[];
  visualizationHtml?: string;
  visualizationUrl?: string;
}

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  isDatasetReady: boolean;
  onSendMessage: (message: string) => void;
}

export const ChatPanel = ({ messages, isLoading, isDatasetReady, onSendMessage }: ChatPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-chat-bg to-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {!isDatasetReady && messages.length === 0 ? (
            /* Welcome Card */
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="max-w-lg p-10 text-center bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-inner">
                    <Database className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground">
                      Welcome to AI Data Analyst
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-[15px]">
                      Transform your raw data into actionable insights with our advanced AI engine. 
                      Upload your dataset to unlock powerful visualizations, statistical analysis, and intelligent recommendations.
                    </p>
                  </div>
                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Get started by uploading your data
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            /* Chat Messages */
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-4 justify-start animate-fade-in">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <Card className="max-w-[85%] p-6 bg-card border-border/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-muted-foreground text-sm font-medium">Analyzing your data...</span>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isDisabled={!isDatasetReady}
        isLoading={isLoading}
      />
    </div>
  );
};