"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { aiService } from '@/lib/ai-service';
import { 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Upload,
  Download,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface HeaderMapping {
  original: string;
  suggested: string;
  confidence: number;
  reason: string;
  confirmed?: boolean;
  customMapping?: string;
}

interface AIHeaderMappingProps {
  headers: string[];
  entityType: 'client' | 'worker' | 'task';
  onMappingConfirmed: (mappings: Record<string, string>) => void;
  onCancel: () => void;
}

export function AIHeaderMapping({ headers, entityType, onMappingConfirmed, onCancel }: AIHeaderMappingProps) {
  const [mappings, setMappings] = useState<HeaderMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const expectedFields = {
    client: ['id', 'name', 'email', 'phone', 'status', 'address', 'metadata'],
    worker: ['id', 'name', 'email', 'skills', 'availability', 'capacity', 'hourlyRate', 'preferences'],
    task: ['id', 'title', 'description', 'assignedTo', 'status', 'priority', 'dueDate', 'estimatedHours', 'attributes']
  };

  const analyzeHeaders = async () => {
    setIsLoading(true);
    try {
      const aiMappings = await aiService.suggestHeaderMapping(headers, entityType);
      
      const headerMappings: HeaderMapping[] = headers.map(header => {
        const aiMapping = aiMappings.find(m => m.original === header);
        if (aiMapping) {
          return {
            original: header,
            suggested: aiMapping.suggested,
            confidence: aiMapping.confidence,
            reason: aiMapping.reason,
            confirmed: aiMapping.confidence > 0.8
          };
        } else {
          return {
            original: header,
            suggested: '',
            confidence: 0,
            reason: 'No automatic mapping found',
            confirmed: false
          };
        }
      });
      
      setMappings(headerMappings);
      setIsAnalyzed(true);
    } catch (error) {
      console.error('Error analyzing headers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapping = (index: number, field: string) => {
    setMappings(prev => prev.map((mapping, i) => 
      i === index 
        ? { ...mapping, customMapping: field, confirmed: true }
        : mapping
    ));
  };

  const confirmMapping = (index: number) => {
    setMappings(prev => prev.map((mapping, i) => 
      i === index 
        ? { ...mapping, confirmed: !mapping.confirmed }
        : mapping
    ));
  };

  const applyMappings = () => {
    const finalMappings: Record<string, string> = {};
    
    mappings.forEach(mapping => {
      if (mapping.confirmed) {
        finalMappings[mapping.original] = mapping.customMapping || mapping.suggested;
      }
    });
    
    onMappingConfirmed(finalMappings);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadgeVariant = (confidence: number): "default" | "destructive" | "outline" | "secondary" => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'outline';
  };

  const confirmedMappings = mappings.filter(m => m.confirmed).length;
  const totalMappings = mappings.length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Header Mapping
        </CardTitle>
        <CardDescription>
          Automatically map your CSV headers to the correct {entityType} fields using AI
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isAnalyzed ? (
          <div className="text-center space-y-4">
            <div className="p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Analyze Headers</h3>
              <p className="text-muted-foreground mb-4">
                Found {headers.length} headers in your CSV file. Click below to let AI suggest the best mappings.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {headers.map((header, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {header}
                  </Badge>
                ))}
              </div>
              <Button 
                onClick={analyzeHeaders} 
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Headers
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Mapping Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    {confirmedMappings} of {totalMappings} headers confirmed
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAnalyzed(false)}>
                  Re-analyze
                </Button>
                <Button 
                  onClick={applyMappings}
                  disabled={confirmedMappings === 0}
                  className="min-w-24"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Apply Mappings
                </Button>
              </div>
            </div>

            {/* Mappings */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {mappings.map((mapping, index) => (
                  <Card key={index} className={`transition-all duration-200 ${
                    mapping.confirmed ? 'border-green-200 bg-green-50' : 'border-muted'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Original Header */}
                        <div className="flex-1">
                          <div className="font-mono text-sm font-medium">
                            {mapping.original}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Original header
                          </div>
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />

                        {/* Mapping Selection */}
                        <div className="flex-2 min-w-48">
                          <Select
                            value={mapping.customMapping || mapping.suggested}
                            onValueChange={(value) => updateMapping(index, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                            <SelectContent>
                              {expectedFields[entityType].map(field => (
                                <SelectItem key={field} value={field}>
                                  {field}
                                </SelectItem>
                              ))}
                              <SelectItem value="">No mapping</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {mapping.suggested && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              AI suggested: {mapping.suggested}
                            </div>
                          )}
                        </div>

                        {/* Confidence & Status */}
                        <div className="flex items-center gap-2">
                          {mapping.confidence > 0 && (
                            <Badge 
                              variant={getConfidenceBadgeVariant(mapping.confidence)}
                              className="text-xs"
                            >
                              {Math.round(mapping.confidence * 100)}%
                            </Badge>
                          )}
                          
                          <Button
                            variant={mapping.confirmed ? "default" : "outline"}
                            size="sm"
                            onClick={() => confirmMapping(index)}
                            className="min-w-20"
                          >
                            {mapping.confirmed ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Confirmed
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Confirm
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Reason */}
                      {mapping.reason && (
                        <div className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded p-2">
                          💡 {mapping.reason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setMappings(prev => prev.map(m => ({ ...m, confirmed: true })));
                  }}
                >
                  Confirm All
                </Button>
                <Button 
                  onClick={applyMappings}
                  disabled={confirmedMappings === 0}
                >
                  Apply {confirmedMappings} Mappings
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AIHeaderMapping;
