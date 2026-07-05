import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';
import { Button } from './Button';
import { Bot, RefreshCw, ChevronRight } from 'lucide-react';

interface AgentCardProps {
  name: string;
  status: 'Ready' | 'Running' | 'Completed';
  inputs: string[];
  outputs: string[];
  lastGenerated?: string;
  onRegenerate?: () => void;
  onViewDetails?: () => void;
  isLoading?: boolean;
}

export function AgentCard({
  name,
  status,
  inputs,
  outputs,
  lastGenerated,
  onRegenerate,
  onViewDetails,
  isLoading
}: AgentCardProps) {
  const statusColors = {
    Ready: 'bg-blue-100 text-blue-700',
    Running: 'bg-yellow-100 text-yellow-700 animate-pulse',
    Completed: 'bg-[#e6f4ea] text-[#137333]'
  };

  return (
    <Card hoverable className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="bg-[#F8FAFD] p-2 rounded-full">
            <Bot className="w-5 h-5 text-[#1A73E8]" />
          </div>
          <CardTitle className="text-base">{name}</CardTitle>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[status]}`}>
          {status}
        </span>
      </CardHeader>
      
      <CardContent className="flex-1 pt-4">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Inputs</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {inputs.map(i => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{i}</span>
              ))}
            </div>
          </div>
          
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outputs</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {outputs.map(o => (
                <span key={o} className="text-xs bg-blue-50 text-[#1A73E8] px-2 py-1 rounded-md">{o}</span>
              ))}
            </div>
          </div>
          
          {lastGenerated && (
            <p className="text-xs text-gray-400 pt-2">Last generated: {lastGenerated}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <Button variant="ghost" size="sm" onClick={onRegenerate} disabled={isLoading} className="text-gray-500 px-0">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
          <Button variant="ghost" size="sm" onClick={onViewDetails} className="text-[#1A73E8] px-0 hover:text-blue-700 hover:bg-transparent">
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
