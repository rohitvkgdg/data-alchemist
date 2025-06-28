"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { AIService } from '@/lib/ai-service';

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Access data store
  const { clients, workers, tasks, clientValidationResults, workerValidationResults, taskValidationResults } = useDataStore();
  const aiService = AIService.getInstance();

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: 'Welcome to Data Alchemist! 🧪✨\n\nI\'m your AI assistant specialized in data validation, rule creation, and intelligent analysis. I can help you:\n\n• Parse and validate CSV/XLSX files\n• Create business rules in plain English\n• Find data using natural language queries\n• Detect and fix data errors\n• Export clean data and configurations\n\nUpload your client, worker, and task files to get started, or ask me anything!',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Generate AI response with context awareness
      const aiResponse = await generateAIResponse(userMessage.content);
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase();
    
    // Analyze current data state for context
    const hasData = clients.length > 0 || workers.length > 0 || tasks.length > 0;
    const hasErrors = clientValidationResults?.errors.length || workerValidationResults?.errors.length || taskValidationResults?.errors.length;
    
    // Natural language data queries
    if (input.includes('show me') || input.includes('find') || input.includes('list') || input.includes('search')) {
      if (!hasData) {
        return 'I don\'t see any data uploaded yet. Please upload your CSV/XLSX files first, then I can help you search through your data!';
      }
      
      try {
        const queryResult = await aiService.processNaturalLanguageQuery(userInput, { clients, workers, tasks });
        if (typeof queryResult === 'string') {
          return queryResult;
        }
        return `🔍 **Query Results:**\n\n${queryResult.interpretation}\n\n${queryResult.result ? JSON.stringify(queryResult.result, null, 2) : 'No results found.'}`;
      } catch (error) {
        return 'I understand you want to search for data, but I need more specific information. Try queries like:\n• "Show me all tasks with duration > 2"\n• "Find workers with React skills"\n• "List high priority clients"';
      }
    }
    
    // Data validation status and error checking
    if (input.includes('validation') || input.includes('validate') || input.includes('error') || input.includes('check')) {
      if (!hasData) {
        return 'No data to validate yet. Upload your client, worker, and task files and I\'ll run comprehensive validations including:\n• Missing columns\n• Duplicate IDs\n• Invalid references\n• Skill coverage gaps\n• Worker overload\n• And 7 more validation types!';
      }
      
      const errorSummary = [];
      if (clientValidationResults?.errors.length) {
        errorSummary.push(`📊 **Client Data**: ${clientValidationResults.errors.length} errors found`);
      }
      if (workerValidationResults?.errors.length) {
        errorSummary.push(`👥 **Worker Data**: ${workerValidationResults.errors.length} errors found`);
      }
      if (taskValidationResults?.errors.length) {
        errorSummary.push(`📋 **Task Data**: ${taskValidationResults.errors.length} errors found`);
      }
      
      if (errorSummary.length === 0) {
        return '✅ **All Good!** Your data passed validation checks. No errors detected in clients, workers, or tasks data.';
      }
      
      return `⚠️ **Validation Issues Found:**\n\n${errorSummary.join('\n')}\n\nCheck the data grids for highlighted errors, or ask me for specific fixes!`;
    }
    
    // Rule creation using natural language
    if (input.includes('rule') || input.includes('create rule') || input.includes('add rule')) {
      try {
        const ruleConfig = await aiService.convertNaturalLanguageToRule(userInput);
        if (ruleConfig) {
          return `✅ **Rule Created Successfully!**\n\n**Type**: ${ruleConfig.type}\n**Description**: ${ruleConfig.description}\n\nThe rule has been added to your configuration. Use "Generate Rules Config" to download the complete rules.json file.`;
        } else {
          return 'I couldn\'t parse that rule. Please be more specific about the constraint you want to create.';
        }
      } catch (error) {
        return 'I can help create rules from natural language! Try phrases like:\n• "Tasks T1 and T2 should run together"\n• "Limit Group A workers to 3 slots per phase"\n• "Task T5 can only run in phases 1-3"\n\nBe specific about task IDs, worker groups, or constraints you want to apply.';
      }
    }
    
    // Data statistics and insights
    if (input.includes('stats') || input.includes('statistics') || input.includes('summary') || input.includes('overview')) {
      if (!hasData) {
        return 'Upload your data files first, then I can provide detailed statistics and insights about your clients, workers, and tasks!';
      }
      
      const stats = [];
      if (clients.length) stats.push(`📊 **Clients**: ${clients.length} total`);
      if (workers.length) stats.push(`👥 **Workers**: ${workers.length} total`);
      if (tasks.length) stats.push(`📋 **Tasks**: ${tasks.length} total`);
      
      // Add skill analysis
      const allSkills = new Set(workers.flatMap(w => w.skills || []));
      const requiredSkills = new Set(tasks.flatMap(t => t.requiredSkills || []));
      const skillCoverage = requiredSkills.size > 0 ? 
        ((Array.from(requiredSkills).filter(skill => allSkills.has(skill)).length / requiredSkills.size) * 100).toFixed(1) : 
        '100';
      
      return `📈 **Data Overview:**\n\n${stats.join('\n')}\n\n🎯 **Skill Coverage**: ${skillCoverage}% of required skills are covered by workers\n\nWant specific insights? Ask me about priorities, workload distribution, or skill gaps!`;
    }
    
    // Greeting responses with data context
    if (input.includes('hello') || input.includes('hi')) {
      const contextMessage = hasData 
        ? `I can see you have ${clients.length} clients, ${workers.length} workers, and ${tasks.length} tasks loaded.` 
        : "I'm ready to help you analyze your data once you upload your CSV/XLSX files.";
        
      return `Hello! I\'m your Data Alchemist AI assistant. ${contextMessage}\n\nI can help you with:\n• Data validation and error detection\n• Creating business rules in plain English\n• Natural language data queries\n• Data corrections and suggestions\n• Export configurations\n\nWhat would you like to work on?`;
    }
    
    // File upload guidance
    if (input.includes('upload') || input.includes('csv') || input.includes('xlsx') || input.includes('file')) {
      return 'I can help you with file uploads! Here\'s what I do:\n\n🔄 **Auto-mapping**: I can map wrongly named columns to correct fields\n✅ **Smart validation**: 12+ comprehensive validation checks\n🛠️ **Error fixing**: Suggestions for data corrections\n📊 **Real-time feedback**: Immediate validation results\n\nDrag & drop your files or use the upload button in the main interface. I support clients.csv, workers.csv, and tasks.csv files.';
    }
    
    // Export help
    if (input.includes('export') || input.includes('download') || input.includes('save')) {
      return 'I can help you export several types of files:\n\n📊 **Clean Data**: Validated client, worker, and task sheets\n⚙️ **Rules Config**: Complete rules.json with all your business rules\n📋 **Validation Report**: Detailed error analysis\n🎯 **Prioritization Settings**: Weight configurations for allocation\n\nUse the export buttons in the main interface, or tell me specifically what you\'d like to download!';
    }
    
    // General help with current context
    if (input.includes('help') || input.includes('what can you do')) {
      const dataStatus = hasData ? 
        `✅ Data loaded: ${clients.length + workers.length + tasks.length} total records` : 
        '📤 No data uploaded yet - start by uploading your CSV/XLSX files';
        
      return `🧪 **Data Alchemist AI Assistant**\n\n**Current Status**: ${dataStatus}\n\n**I can help you with:**\n\n🔍 **Smart Analysis**: Natural language queries about your data\n⚡ **Validation**: 12+ types of data integrity checks\n� **Rule Creation**: Convert plain English to business rules\n🛠️ **Data Fixing**: Intelligent error correction suggestions\n� **Export Tools**: Clean data and configuration files\n\n**Try asking me:**\n• "Check for validation errors"\n• "Show me high priority clients"\n• "Create a rule that tasks T1 and T2 run together"\n• "Fix the data errors you found"`;
    }
    
    // Default response with helpful suggestions
    return `I'm here to help with your Data Alchemist workflow! You can ask me to:\n\n• **Analyze data**: "Show me all tasks requiring React skills"\n• **Check validation**: "Are there any errors in my data?"\n• **Create rules**: "Tasks A and B should run together"\n• **Get insights**: "What's my skill coverage percentage?"\n• **Fix issues**: "Suggest fixes for the validation errors"\n\n${hasData ? 'I can see your uploaded data and' : 'Upload your data files and I'} can provide specific analysis!`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 sm:w-96 h-[500px] shadow-xl z-50 flex flex-col overflow-hidden border-border p-0 px-2">
      {/* Compact header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 flex-shrink-0 border-b [.border-b]:p-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          AI Chat
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      
      {/* Messages area - maximized for text display */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 max-w-full",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.type === 'ai' && (
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-[260px] sm:max-w-[300px] break-words",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                {message.type === 'user' && (
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-3 w-3 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex gap-2 justify-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      {/* Compact input area */}
      <div className="p-3 pt-2 flex-shrink-0 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isProcessing}
            className="flex-1 h-8 text-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
