import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatPanel } from '@/components/ChatPanel';
import { UploadModal } from '@/components/UploadModal';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Define the types for our data structures
interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  summary?: string;
  table?: Record<string, any>[];
  visualizationHtml?: string;
  visualizationUrl?: string;
}

interface Dataset {
  id: string;
  name: string;
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_FLASK_API_BASE_URL}/api/datasets`);
        const datasetIds: string[] = response.data;
        const formattedDatasets: Dataset[] = datasetIds.map(id => ({
          id: id,
          name: id 
        }));
        setDatasets(formattedDatasets);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch existing datasets.",
          variant: "destructive",
        });
      }
    };
    fetchDatasets();
  }, [toast]);

  const handleUploadSuccess = (uploadResponse: { dataset_id: string }) => {
    const newId = uploadResponse.dataset_id;
    const newDataset: Dataset = {
      id: newId,
      name: newId
    };
    setDatasets(prev => [newDataset, ...prev]);
    setActiveDatasetId(newDataset.id);
  };
  
  const handleDatasetSelect = (datasetId: string) => {
    setActiveDatasetId(datasetId);
  };

  const handleSendMessage = async (content: string) => {
      if (!activeDatasetId) {
        toast({
          title: "No Dataset Selected",
          description: "Please select or upload a dataset before sending a query.",
          variant: "destructive",
        });
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content,
      };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_FLASK_API_BASE_URL}/api/query`, 
          { query: content, dataset_id: activeDatasetId }
        );
      
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: response.data.summary,
          summary: response.data.summary,
          table: response.data.table,
          visualizationHtml: response.data.visualizationHtml,
          visualizationUrl: response.data.visualizationUrl,
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process your query. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="h-screen bg-background flex">
      <Sidebar
        onUploadClick={() => setIsModalOpen(true)}
        isDatasetReady={!!activeDatasetId}
        datasets={datasets}
        activeDatasetId={activeDatasetId}
        onDatasetSelect={handleDatasetSelect}
      />

      {/* --- THIS IS THE FIX --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          isDatasetReady={!!activeDatasetId}
          onSendMessage={handleSendMessage}
        />
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Index;