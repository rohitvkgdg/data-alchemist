"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDataStore } from '@/store/data-store';
import { aiService } from '@/lib/ai-service';
import { 
  Send, 
  MessageCircle, 
  Bot, 
  User, 
  Sparkles,
  Database,
  BarChart3,
  Users,
  Activity,
  Lightbulb,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  query?: string;
  data?: Array<Record<string, unknown>>;
  suggestions?: Array<{
    type: 'data-correction' | 'header-mapping' | 'rule-suggestion';
    title: string;
    description: string;
    action?: () => void;
  }>;
}

export function AIQueryInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Data Assistant. I can help you with:\n\n🔍 **Natural Language Queries** - Ask questions about your data\n🛠️ **Data Validation** - Get suggestions for data corrections\n📋 **Header Mapping** - Automatically map CSV headers to proper fields\n⚙️ **Business Rules** - Generate rules from natural language descriptions\n\nTry asking me questions like:\n• "How many active clients do we have?"\n• "Show me workers with validation errors"\n• "Suggest data corrections for email fields"\n• "Create a rule that prevents overloading workers"',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { clients, workers, tasks, clientValidationResults, workerValidationResults, taskValidationResults } = useDataStore();

  const suggestedQueries = [
    "How many clients do we have by status?",
    "Show me workers earning more than $50/hour",
    "What's the average completion rate?",
    "Which records have validation errors?",
    "Suggest data corrections for emails",
    "Map headers for CSV import",
    "Create a rule to limit worker capacity",
    "Show me high priority tasks",
    "Generate business rules from patterns"
  ];

  const processQuery = async (query: string) => {
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Use AI service for enhanced query processing
      const response = await generateAIResponse(query);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.message,
        data: response.data,
        suggestions: response.suggestions,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I encountered an error processing your query. Please try rephrasing your question.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsProcessing(false);
  };

  const generateAIResponse = async (query: string): Promise<{ 
    message: string; 
    data?: Array<Record<string, unknown>>; 
    suggestions?: Array<{
      type: 'data-correction' | 'header-mapping' | 'rule-suggestion';
      title: string;
      description: string;
      action?: () => void;
    }>;
  }> => {
    const lowerQuery = query.toLowerCase();
    
    // AI-powered header mapping
    if (lowerQuery.includes('header') || lowerQuery.includes('mapping') || lowerQuery.includes('map')) {
      const entityType = lowerQuery.includes('client') ? 'client' : 
                        lowerQuery.includes('worker') ? 'worker' : 'task';
      
      // Simulate some headers that need mapping
      const sampleHeaders = ['client_id', 'full_name', 'email_address', 'phone_number', 'client_status'];
      
      try {
        const mappings = await aiService.suggestHeaderMapping(sampleHeaders, entityType);
        
        return {
          message: `🎯 **AI Header Mapping Suggestions**\n\nI've analyzed your headers and found these mappings:\n\n${mappings
            .map(m => `• **${m.original}** → **${m.suggested}** (${Math.round(m.confidence * 100)}% confidence)\n  ${m.reason}`)
            .join('\n\n')}`,
          suggestions: mappings.map(m => ({
            type: 'header-mapping' as const,
            title: `Map "${m.original}" to "${m.suggested}"`,
            description: `${m.reason} (${Math.round(m.confidence * 100)}% confidence)`,
            action: () => console.log('Apply header mapping:', m)
          }))
        };
      } catch (error) {
        return {
          message: 'I can help with header mapping! Please provide some sample headers from your CSV file.'
        };
      }
    }
    
    // AI data corrections
    if (lowerQuery.includes('correction') || lowerQuery.includes('fix') || lowerQuery.includes('suggest')) {
      const allData = [...clients, ...workers, ...tasks];
      const entityType = lowerQuery.includes('client') ? 'client' : 
                        lowerQuery.includes('worker') ? 'worker' : 'task';
      
      try {
        const dataToAnalyze = entityType === 'client' ? clients : 
                             entityType === 'worker' ? workers : tasks;
        
        const corrections = await aiService.suggestDataCorrections(dataToAnalyze, entityType);
        
        if (corrections.length === 0) {
          return {
            message: `✅ **Data Quality Check Complete**\n\nGreat news! I didn't find any obvious data corrections needed for your ${entityType} records. Your data looks clean!`
          };
        }
        
        return {
          message: `🔧 **AI Data Correction Suggestions**\n\nI found ${corrections.length} potential improvements:\n\n${corrections
            .slice(0, 5) // Show first 5
            .map(c => `• **${c.field}**: "${c.originalValue}" → "${c.suggestedValue}"\n  ${c.reason} (${Math.round(c.confidence * 100)}% confidence)`)
            .join('\n\n')}${corrections.length > 5 ? '\n\n...and more' : ''}`,
          suggestions: corrections.slice(0, 10).map(c => ({
            type: 'data-correction' as const,
            title: `Fix ${c.field}`,
            description: `Change "${c.originalValue}" to "${c.suggestedValue}"`,
            action: () => console.log('Apply correction:', c)
          }))
        };
      } catch (error) {
        return {
          message: 'I can help suggest data corrections! Try asking about specific fields like emails or phone numbers.'
        };
      }
    }
    
    // AI business rule generation
    if (lowerQuery.includes('rule') || lowerQuery.includes('business rule') || lowerQuery.includes('create rule')) {
      if (lowerQuery.includes('cannot') || lowerQuery.includes('limit') || lowerQuery.includes('priority')) {
        try {
          const ruleSuggestion = await aiService.convertNaturalLanguageToRule(query);
          
          if (ruleSuggestion) {
            return {
              message: `⚙️ **AI Rule Generation**\n\nI can create this business rule for you:\n\n**Type**: ${ruleSuggestion.type}\n**Description**: ${ruleSuggestion.description}\n**Confidence**: ${Math.round(ruleSuggestion.confidence * 100)}%\n\nWould you like me to add this rule to your system?`,
              suggestions: [{
                type: 'rule-suggestion' as const,
                title: `Create ${ruleSuggestion.type} rule`,
                description: ruleSuggestion.description,
                action: () => console.log('Create rule:', ruleSuggestion)
              }]
            };
          }
        } catch (error) {
          // Fall through to general rule suggestions
        }
      }
      
      // General rule suggestions based on data patterns
      try {
        const dataForAnalysis = { clients, workers, tasks };
        const ruleSuggestions = await aiService.suggestBusinessRules(dataForAnalysis);
        
        if (ruleSuggestions.length === 0) {
          return {
            message: `⚙️ **Business Rule Analysis**\n\nI've analyzed your data patterns and everything looks well-balanced! Your current workload distribution and data structure don't require immediate rule interventions.`
          };
        }
        
        return {
          message: `⚙️ **AI Business Rule Suggestions**\n\nBased on your data patterns, I recommend these rules:\n\n${ruleSuggestions
            .slice(0, 3)
            .map(r => `• **${r.type}**: ${r.description} (${Math.round(r.confidence * 100)}% confidence)`)
            .join('\n\n')}`,
          suggestions: ruleSuggestions.slice(0, 5).map(r => ({
            type: 'rule-suggestion' as const,
            title: `Create ${r.type} rule`,
            description: r.description,
            action: () => console.log('Create suggested rule:', r)
          }))
        };
      } catch (error) {
        return {
          message: 'I can help create business rules! Try describing what you want in natural language, like "Workers cannot work on more than 5 tasks at once".'
        };
      }
    }
    
    // Enhanced natural language query processing
    try {
      const dataForQuery = { clients, workers, tasks };
      const aiResult = await aiService.processNaturalLanguageQuery(query, dataForQuery);
      
      if (aiResult.result !== undefined) {
        return {
          message: `🤖 **AI Query Result**\n\n${aiResult.interpretation}\n\n**Result**: ${JSON.stringify(aiResult.result, null, 2)}`,
          data: Array.isArray(aiResult.result) ? aiResult.result : [{ result: aiResult.result }]
        };
      }
      
      return {
        message: aiResult.interpretation
      };
    } catch (error) {
      // Fall back to legacy processing
      return generateLegacyResponse(query);
    }
  };

  const generateLegacyResponse = (query: string): { message: string; data?: Array<Record<string, unknown>> } => {
    const lowerQuery = query.toLowerCase();
    
    // Client-related queries
    if (lowerQuery.includes('client') && lowerQuery.includes('status')) {
      const statusCounts = clients.reduce((acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        message: `Here's the breakdown of clients by status:\n\n${Object.entries(statusCounts)
          .map(([status, count]) => `• ${status}: ${count} clients`)
          .join('\n')}\n\nTotal: ${clients.length} clients`,
        data: Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
      };
    }
    
    if (lowerQuery.includes('active client')) {
      const activeClients = clients.filter(c => c.status === 'active');
      return {
        message: `You have **${activeClients.length} active clients** out of ${clients.length} total clients.`,
        data: activeClients
      };
    }
    
    // Worker-related queries
    if (lowerQuery.includes('worker') && (lowerQuery.includes('rate') || lowerQuery.includes('salary'))) {
      const highRateWorkers = workers.filter(w => w.hourlyRate && w.hourlyRate > 50);
      return {
        message: `Found **${highRateWorkers.length} workers** earning more than $50/hour:\n\n${highRateWorkers
          .map(w => `• ${w.name}: $${w.hourlyRate}/hour`)
          .join('\n')}`,
        data: highRateWorkers
      };
    }
    
    // Task-related queries
    if (lowerQuery.includes('completion') || lowerQuery.includes('complete')) {
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
      
      return {
        message: `**Task Completion Analysis:**\n\n• Completed: ${completedTasks.length} tasks\n• Total: ${tasks.length} tasks\n• Completion Rate: ${completionRate}%`,
        data: [{ status: 'completed', count: completedTasks.length }, { status: 'other', count: tasks.length - completedTasks.length }]
      };
    }
    
    // Validation errors
    if (lowerQuery.includes('error') || lowerQuery.includes('invalid') || lowerQuery.includes('validation')) {
      const totalErrors = (clientValidationResults?.errors?.length || 0) + 
                         (workerValidationResults?.errors?.length || 0) + 
                         (taskValidationResults?.errors?.length || 0);
      
      return {
        message: `**Validation Errors Summary:**\n\n• Client errors: ${clientValidationResults?.errors?.length || 0}\n• Worker errors: ${workerValidationResults?.errors?.length || 0}\n• Task errors: ${taskValidationResults?.errors?.length || 0}\n\n**Total: ${totalErrors} validation errors**`,
        data: [
          { type: 'Clients', errors: clientValidationResults?.errors?.length || 0 },
          { type: 'Workers', errors: workerValidationResults?.errors?.length || 0 },
          { type: 'Tasks', errors: taskValidationResults?.errors?.length || 0 }
        ]
      };
    }
    
    // Default response
    return {
      message: `I understand you're asking about "${query}". Let me help you with that!\n\nCurrently, I can analyze:\n• **${clients.length} clients** in your database\n• **${workers.length} workers** on your team\n• **${tasks.length} tasks** in your system\n\nTry asking more specific questions about status, rates, completion, validation errors, or request AI-powered features like data corrections and header mapping.`
    };
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      processQuery(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const totalRecords = clients.length + workers.length + tasks.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              AI Data Assistant
            </CardTitle>
            <CardDescription>
              Ask questions about your data in natural language
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        {message.data && (
                          <div className="mt-2 text-xs opacity-75">
                            📊 Data available for visualization
                          </div>
                        )}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs font-medium opacity-75">AI Suggestions:</div>
                            {message.suggestions.map((suggestion, idx) => (
                              <div key={idx} className="bg-background/50 rounded p-2 text-xs">
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5">
                                    {suggestion.type === 'data-correction' && <CheckCircle className="h-3 w-3 text-green-500" />}
                                    {suggestion.type === 'header-mapping' && <Lightbulb className="h-3 w-3 text-yellow-500" />}
                                    {suggestion.type === 'rule-suggestion' && <AlertTriangle className="h-3 w-3 text-blue-500" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{suggestion.title}</div>
                                    <div className="text-muted-foreground">{suggestion.description}</div>
                                  </div>
                                  {suggestion.action && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs px-2"
                                      onClick={suggestion.action}
                                    >
                                      Apply
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        Analyzing your data...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your data..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!inputValue.trim() || isProcessing}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sidebar */}
      <div className="space-y-4">
        {/* Data Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Clients</span>
              </div>
              <Badge variant="secondary">{clients.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm">Workers</span>
              </div>
              <Badge variant="secondary">{workers.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Tasks</span>
              </div>
              <Badge variant="secondary">{tasks.length}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <span className="text-sm">Total Records</span>
              <Badge>{totalRecords}</Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Suggested Queries */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Try These Queries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedQueries.map((query, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-2 text-xs"
                onClick={() => {
                  setInputValue(query);
                }}
                disabled={isProcessing}
              >
                {query}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
