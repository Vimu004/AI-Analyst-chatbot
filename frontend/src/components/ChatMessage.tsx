import { useEffect, useRef } from 'react';
import { User, Sparkles, ExternalLink, Download } from 'lucide-react'; // 1. Import Download icon
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define the structure of a message object
interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  summary?: string;
  table?: Record<string, any>[];
  visualizationHtml?: string;
  visualizationUrl?: string;
}

interface ChatMessageProps {
  message: Message;
}

// Get the Flask API base URL from environment variables
const FLASK_BASE_URL = import.meta.env.VITE_FLASK_API_BASE_URL;

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const vizRef = useRef<HTMLDivElement>(null);

  const handleOpenVisualization = () => {
    if (message.visualizationUrl) {
      const fullUrl = `${FLASK_BASE_URL}${message.visualizationUrl}`;
      window.open(fullUrl, '_blank');
    }
  };
  
  // 2. Add a function to handle CSV download
  const handleDownloadCsv = () => {
    if (!message.table || message.table.length === 0) return;

    const headers = Object.keys(message.table[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...message.table.map(row => 
        headers.map(header => JSON.stringify(row[header], (_, value) => value ?? '')).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (vizRef.current && message.visualizationHtml) {
      const existingScripts = vizRef.current.querySelectorAll('script.viz-script');
      existingScripts.forEach(s => s.remove());

      const scripts = vizRef.current.querySelectorAll("script");
      scripts.forEach(script => {
        const newScript = document.createElement("script");
        newScript.innerHTML = script.innerHTML;
        newScript.className = 'viz-script';
        document.body.appendChild(newScript);
      });
    }
  }, [message.visualizationHtml]);

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
      )}

      <div className={`max-w-[85%] space-y-4 ${isUser ? 'order-first' : ''}`}>
        <Card className={`${
          isUser 
            ? 'bg-primary text-primary-foreground shadow-md' 
            : 'bg-card border-border/50 shadow-sm'
        } transition-all duration-200`}>
          {isUser ? (
            <div className="p-4">
              <p className="whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* AI Summary */}
              {message.summary && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed text-[15px]">
                    {message.summary}
                  </p>
                </div>
              )}

              {/* Data Table */}
              {message.table && message.table.length > 0 && (
                <div className="space-y-3">
                  {/* 3. Update the header to include the button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full"></div>
                      <h4 className="text-sm font-semibold text-foreground">Data Results</h4>
                    </div>
                    <Button onClick={handleDownloadCsv} variant="ghost" size="sm" className="h-8 px-2 text-xs">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download CSV
                    </Button>
                  </div>
                  
                  <div className="rounded-xl border border-border overflow-auto max-h-80 bg-background/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/70">
                          {Object.keys(message.table[0]).map((header, index) => (
                            <TableHead key={index} className="font-semibold text-foreground text-xs uppercase tracking-wider sticky top-0 bg-muted/95 backdrop-blur-sm">
                              {header.replace(/_/g, ' ')}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {message.table.map((row, rowIndex) => (
                          <TableRow key={rowIndex} className={`hover:bg-muted/30 transition-colors ${rowIndex % 2 === 0 ? 'bg-background/50' : 'bg-muted/10'}`}>
                            {Object.values(row).map((cell, cellIndex) => (
                              <TableCell key={cellIndex} className="text-foreground font-medium text-sm py-3">
                                {typeof cell === 'number' ? cell.toLocaleString() : cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Visualization and Fallback sections remain unchanged */}
              {message.visualizationHtml && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full"></div>
                      <h4 className="text-sm font-semibold text-foreground">Visualization</h4>
                    </div>
                    {message.visualizationUrl && (
                      <Button onClick={handleOpenVisualization} variant="outline" size="sm" className="h-8 px-3 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open in New Tab
                      </Button>
                    )}
                  </div>
                  <div 
                    ref={vizRef}
                    className="rounded-xl border border-border overflow-hidden bg-background/50 p-4"
                    dangerouslySetInnerHTML={{ __html: message.visualizationHtml }}
                  />
                </div>
              )}

              {message.visualizationUrl && !message.visualizationHtml && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full"></div>
                      <h4 className="text-sm font-semibold text-foreground">Visualization</h4>
                    </div>
                    <Button onClick={handleOpenVisualization} variant="outline" size="sm" className="h-8 px-3 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open in New Tab
                    </Button>
                  </div>
                  <div className="rounded-xl border border-border overflow-auto bg-background/50 max-h-80">
                    <img
                      src={`${FLASK_BASE_URL}${message.visualizationUrl}`}
                      alt="Data visualization"
                      className="w-full h-auto max-h-96 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted/80 flex items-center justify-center shadow-sm">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};