import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isDisabled, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim() || isDisabled || isLoading) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const InputComponent = (
    <div className={`p-6 border-t border-border bg-background/80 backdrop-blur-md ${isDisabled ? 'opacity-60' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isDisabled ? "Upload a dataset to begin analyzing..." : "Ask me anything about your data..."}
            disabled={isDisabled || isLoading}
            className="min-h-[60px] max-h-32 resize-none pr-16 bg-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-[15px] placeholder:text-muted-foreground/60 transition-all duration-200 shadow-sm"
            rows={1}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isDisabled || isLoading}
            size="sm"
            className={`absolute right-3 top-3 h-10 w-10 p-0 rounded-lg transition-all duration-200 ${
              !input.trim() || isDisabled || isLoading
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg'
            }`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!isDisabled && (
          <p className="text-xs text-muted-foreground/60 mt-3 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        )}
      </div>
    </div>
  );

  if (isDisabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{InputComponent}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>Please upload a dataset to begin analyzing your data</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return InputComponent;
};