import { Upload, Database, Sparkles, FileSpreadsheet, BarChart3, Brain, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added for dropdown
import { useState } from 'react';

// Define a type for a single dataset
interface Dataset {
  id: string;
  name: string;
}

// Update component props to include dataset management
interface SidebarProps {
  onUploadClick: () => void;
  isDatasetReady: boolean;
  datasets: Dataset[];
  activeDatasetId: string | null;
  onDatasetSelect: (datasetId: string) => void;
}

export const Sidebar = ({ 
  onUploadClick, 
  isDatasetReady,
  datasets,
  activeDatasetId,
  onDatasetSelect
}: SidebarProps) => {
  const [featuresOpen, setFeaturesOpen] = useState(true);

  return (
    <div className="w-180 h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">AI Analyst</h1>
              <p className="text-sm text-sidebar-foreground/60">Data Intelligence Platform</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Upload Section */}
      <div className="p-6">
        <Button
          onClick={onUploadClick}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all hover:shadow-md"
          size="lg"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload New Dataset
        </Button>
      </div>

      {/* Dataset Status */}
      <div className="px-6 pb-6">
        <Card className="p-4 bg-sidebar-accent/50 border-sidebar-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDatasetReady 
                ? 'bg-success/20 text-success' 
                : 'bg-muted/20 text-muted-foreground'
            }`}>
              {isDatasetReady ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">Dataset Status</p>
              <p className="text-xs text-sidebar-foreground/60">
                {isDatasetReady ? 'Ready for analysis' : 'No dataset loaded'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* --- NEW: Dataset Selection Dropdown --- */}
      <div className="px-6 pb-6 border-b border-sidebar-border">
         <h3 className="mb-2 text-xs font-semibold text-sidebar-foreground/80 uppercase tracking-wider">
          Active Dataset
        </h3>
        <Select
          value={activeDatasetId ?? ''}
          onValueChange={onDatasetSelect}
          disabled={datasets.length === 0}
        >
          <SelectTrigger className="w-full bg-sidebar-accent/50 border-sidebar-border shadow-sm text-sidebar-foreground">
             <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-sidebar-foreground/60" />
              <SelectValue placeholder="Select a dataset" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {datasets.map((dataset) => (
              <SelectItem key={dataset.id} value={dataset.id}>
                {dataset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 pt-6">
        <Collapsible open={featuresOpen} onOpenChange={setFeaturesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h3 className="text-sm font-semibold text-sidebar-foreground uppercase tracking-wider">
              Available Features
            </h3>
            <Sparkles className="h-4 w-4 text-sidebar-foreground/60 group-hover:text-primary transition-colors" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-4">
            {[
              { icon: FileSpreadsheet, label: 'Data Analysis', desc: 'Statistical insights', color: 'text-blue-500' },
              { icon: BarChart3, label: 'Visualizations', desc: 'Interactive charts', color: 'text-green-500' },
              { icon: Database, label: 'Query Processing', desc: 'Natural language', color: 'text-purple-500' },
              { icon: Sparkles, label: 'AI Insights', desc: 'Smart recommendations', color: 'text-yellow-500' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200 cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">{feature.label}</p>
                  <p className="text-xs text-sidebar-foreground/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer */}
      <div className="p-6 mt-auto border-t border-sidebar-border">
        <div className="text-center">
          <p className="text-xs text-sidebar-foreground/40 font-medium">
            Developed by Vimuthu Thesara • Version 2.0
          </p>
          <div className="mt-2 flex justify-center">
            <div className="w-8 h-1 bg-gradient-to-r from-primary/50 to-primary rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};