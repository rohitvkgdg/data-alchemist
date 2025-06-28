// AI Service for Data Alchemist
// This service handles AI-powered features including header mapping, validation, and natural language processing

interface AIHeaderMapping {
  original: string;
  suggested: string;
  confidence: number;
  reason: string;
}

interface AIValidationSuggestion {
  field: string;
  originalValue: unknown;
  suggestedValue: unknown;
  confidence: number;
  reason: string;
}

interface AIRuleSuggestion {
  type: 'co-run' | 'slot-restriction' | 'load-limit' | 'phase-window' | 'pattern-match' | 'precedence-override';
  description: string;
  confidence: number;
  ruleData: Record<string, unknown>;
}

export class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // AI Header Mapping
  async suggestHeaderMapping(headers: string[], entityType: 'client' | 'worker' | 'task'): Promise<AIHeaderMapping[]> {
    const expectedHeaders = this.getExpectedHeaders(entityType);
    const mappings: AIHeaderMapping[] = [];

    for (const header of headers) {
      const suggestion = this.findBestHeaderMatch(header, expectedHeaders);
      if (suggestion) {
        mappings.push({
          original: header,
          suggested: suggestion.field,
          confidence: suggestion.confidence,
          reason: suggestion.reason
        });
      }
    }

    return mappings;
  }

  // AI Data Validation and Correction
  async suggestDataCorrections(data: Record<string, unknown>[], entityType: 'client' | 'worker' | 'task'): Promise<AIValidationSuggestion[]> {
    const suggestions: AIValidationSuggestion[] = [];

    for (const row of data) {
      for (const [field, value] of Object.entries(row)) {
        const correction = this.suggestFieldCorrection(field, value, entityType);
        if (correction) {
          suggestions.push(correction);
        }
      }
    }

    return suggestions;
  }

  // Natural Language Query Processing
  async processNaturalLanguageQuery(query: string, data: {
    clients: Record<string, unknown>[];
    workers: Record<string, unknown>[];
    tasks: Record<string, unknown>[];
  }): Promise<{
    interpretation: string;
    action: 'filter' | 'aggregate' | 'transform' | 'create' | 'update';
    parameters: Record<string, unknown>;
    sqlLike?: string;
    result?: unknown;
  }> {
    const queryLower = query.toLowerCase();
    
    // Pattern matching for common queries
    if (queryLower.includes('show') || queryLower.includes('list') || queryLower.includes('find')) {
      return this.processFilterQuery(query, data);
    }
    
    if (queryLower.includes('count') || queryLower.includes('how many') || queryLower.includes('total')) {
      return this.processAggregateQuery(query, data);
    }
    
    if (queryLower.includes('create') || queryLower.includes('add') || queryLower.includes('new')) {
      return this.processCreateQuery(query, data);
    }
    
    if (queryLower.includes('update') || queryLower.includes('change') || queryLower.includes('modify')) {
      return this.processUpdateQuery(query, data);
    }

    return {
      interpretation: "I couldn't understand that query. Try asking to show, count, create, or update data.",
      action: 'filter',
      parameters: {}
    };
  }

  // AI Rule Recommendations
  async suggestBusinessRules(data: {
    clients: Record<string, unknown>[];
    workers: Record<string, unknown>[];
    tasks: Record<string, unknown>[];
  }): Promise<AIRuleSuggestion[]> {
    const suggestions: AIRuleSuggestion[] = [];

    // Analyze data patterns for rule suggestions
    suggestions.push(...this.analyzeWorkloadPatterns(data));
    suggestions.push(...this.analyzeSkillGaps(data));
    suggestions.push(...this.analyzePriorityPatterns(data));

    return suggestions;
  }

  // Natural Language to Rule Conversion
  async convertNaturalLanguageToRule(description: string): Promise<AIRuleSuggestion | null> {
    const descLower = description.toLowerCase();

    if (descLower.includes('cannot') && descLower.includes('same time')) {
      return {
        type: 'co-run',
        description: `Prevent concurrent execution based on: ${description}`,
        confidence: 0.8,
        ruleData: {
          restriction: 'no-concurrent',
          entities: this.extractEntitiesFromText(description)
        }
      };
    }

    if (descLower.includes('limit') && (descLower.includes('worker') || descLower.includes('capacity'))) {
      return {
        type: 'load-limit',
        description: `Capacity restriction based on: ${description}`,
        confidence: 0.75,
        ruleData: {
          type: 'capacity',
          limit: this.extractNumberFromText(description) || 5
        }
      };
    }

    if (descLower.includes('priority') || descLower.includes('urgent') || descLower.includes('important')) {
      return {
        type: 'precedence-override',
        description: `Priority rule based on: ${description}`,
        confidence: 0.7,
        ruleData: {
          condition: this.extractPriorityCondition(description),
          override: true
        }
      };
    }

    return null;
  }

  // Private helper methods
  private getExpectedHeaders(entityType: 'client' | 'worker' | 'task'): { field: string; aliases: string[] }[] {
    const headerMaps = {
      client: [
        { field: 'id', aliases: ['client_id', 'clientid', 'identifier', 'client-id'] },
        { field: 'name', aliases: ['client_name', 'clientname', 'full_name', 'fullname'] },
        { field: 'email', aliases: ['email_address', 'emailaddress', 'e_mail', 'e-mail'] },
        { field: 'phone', aliases: ['phone_number', 'phonenumber', 'telephone', 'mobile'] },
        { field: 'status', aliases: ['client_status', 'state', 'condition'] },
        { field: 'address', aliases: ['location', 'address_line', 'full_address'] },
        { field: 'metadata', aliases: ['meta', 'additional_info', 'custom_data', 'extras'] }
      ],
      worker: [
        { field: 'id', aliases: ['worker_id', 'workerid', 'employee_id', 'emp_id'] },
        { field: 'name', aliases: ['worker_name', 'workername', 'full_name', 'employee_name'] },
        { field: 'email', aliases: ['email_address', 'work_email', 'contact_email'] },
        { field: 'skills', aliases: ['skill_set', 'skillset', 'abilities', 'competencies'] },
        { field: 'availability', aliases: ['schedule', 'working_hours', 'available_time'] },
        { field: 'capacity', aliases: ['max_capacity', 'workload', 'bandwidth'] },
        { field: 'preferences', aliases: ['prefs', 'settings', 'custom_preferences'] }
      ],
      task: [
        { field: 'id', aliases: ['task_id', 'taskid', 'ticket_id', 'job_id'] },
        { field: 'title', aliases: ['task_title', 'name', 'task_name', 'description'] },
        { field: 'description', aliases: ['details', 'task_description', 'summary'] },
        { field: 'assignedTo', aliases: ['assigned_to', 'worker_id', 'assignee'] },
        { field: 'status', aliases: ['task_status', 'state', 'progress'] },
        { field: 'priority', aliases: ['task_priority', 'importance', 'urgency'] },
        { field: 'dueDate', aliases: ['due_date', 'deadline', 'target_date'] },
        { field: 'estimatedHours', aliases: ['estimated_hours', 'duration', 'effort'] },
        { field: 'attributes', aliases: ['attrs', 'custom_attributes', 'properties'] }
      ]
    };

    return headerMaps[entityType];
  }

  private findBestHeaderMatch(header: string, expectedHeaders: { field: string; aliases: string[] }[]): { field: string; confidence: number; reason: string } | null {
    const headerLower = header.toLowerCase().replace(/[-_\s]/g, '');
    
    for (const expected of expectedHeaders) {
      // Exact match
      if (expected.field.toLowerCase() === headerLower) {
        return { field: expected.field, confidence: 1.0, reason: 'Exact match' };
      }
      
      // Alias match
      for (const alias of expected.aliases) {
        const aliasNormalized = alias.toLowerCase().replace(/[-_\s]/g, '');
        if (aliasNormalized === headerLower) {
          return { field: expected.field, confidence: 0.9, reason: `Matched alias: ${alias}` };
        }
      }
      
      // Partial match
      if (headerLower.includes(expected.field.toLowerCase()) || expected.field.toLowerCase().includes(headerLower)) {
        return { field: expected.field, confidence: 0.7, reason: 'Partial match' };
      }
    }
    
    return null;
  }

  private suggestFieldCorrection(field: string, value: unknown, entityType: 'client' | 'worker' | 'task'): AIValidationSuggestion | null {
    const valueStr = String(value || '').trim();
    
    // Email validation and correction
    if (field.toLowerCase().includes('email') && valueStr) {
      if (!this.isValidEmail(valueStr)) {
        const corrected = this.suggestEmailCorrection(valueStr);
        if (corrected !== valueStr) {
          return {
            field,
            originalValue: value,
            suggestedValue: corrected,
            confidence: 0.8,
            reason: 'Email format correction'
          };
        }
      }
    }
    
    // Phone number formatting
    if (field.toLowerCase().includes('phone') && valueStr) {
      const formatted = this.formatPhoneNumber(valueStr);
      if (formatted !== valueStr) {
        return {
          field,
          originalValue: value,
          suggestedValue: formatted,
          confidence: 0.9,
          reason: 'Phone number formatting'
        };
      }
    }
    
    // Status standardization
    if (field.toLowerCase().includes('status') && valueStr) {
      const standardized = this.standardizeStatus(valueStr, entityType);
      if (standardized !== valueStr) {
        return {
          field,
          originalValue: value,
          suggestedValue: standardized,
          confidence: 0.85,
          reason: 'Status standardization'
        };
      }
    }
    
    return null;
  }

  private processFilterQuery(query: string, data: any): any {
    // Simple query processing - in a real implementation, this would use NLP
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('client')) {
      return {
        interpretation: `Showing clients based on query: ${query}`,
        action: 'filter' as const,
        parameters: { entity: 'clients' },
        result: data.clients.slice(0, 10) // Limit results
      };
    }
    
    if (queryLower.includes('worker')) {
      return {
        interpretation: `Showing workers based on query: ${query}`,
        action: 'filter' as const,
        parameters: { entity: 'workers' },
        result: data.workers.slice(0, 10)
      };
    }
    
    if (queryLower.includes('task')) {
      return {
        interpretation: `Showing tasks based on query: ${query}`,
        action: 'filter' as const,
        parameters: { entity: 'tasks' },
        result: data.tasks.slice(0, 10)
      };
    }
    
    return {
      interpretation: "Please specify whether you want to see clients, workers, or tasks",
      action: 'filter' as const,
      parameters: {}
    };
  }

  private processAggregateQuery(query: string, data: any): any {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('client')) {
      return {
        interpretation: `Counting clients`,
        action: 'aggregate' as const,
        parameters: { entity: 'clients', operation: 'count' },
        result: data.clients.length
      };
    }
    
    if (queryLower.includes('worker')) {
      return {
        interpretation: `Counting workers`,
        action: 'aggregate' as const,
        parameters: { entity: 'workers', operation: 'count' },
        result: data.workers.length
      };
    }
    
    if (queryLower.includes('task')) {
      return {
        interpretation: `Counting tasks`,
        action: 'aggregate' as const,
        parameters: { entity: 'tasks', operation: 'count' },
        result: data.tasks.length
      };
    }
    
    return {
      interpretation: "I can count clients, workers, or tasks. Please specify what you'd like to count.",
      action: 'aggregate' as const,
      parameters: {}
    };
  }

  private processCreateQuery(query: string, data: any): any {
    return {
      interpretation: `Create operation requested: ${query}`,
      action: 'create' as const,
      parameters: { query },
      result: "Create functionality would be implemented here"
    };
  }

  private processUpdateQuery(query: string, data: any): any {
    return {
      interpretation: `Update operation requested: ${query}`,
      action: 'update' as const,
      parameters: { query },
      result: "Update functionality would be implemented here"
    };
  }

  private analyzeWorkloadPatterns(data: any): AIRuleSuggestion[] {
    const suggestions: AIRuleSuggestion[] = [];
    
    // Check for overloaded workers
    if (data.workers.length > 0 && data.tasks.length > 0) {
      const avgTasksPerWorker = data.tasks.length / data.workers.length;
      if (avgTasksPerWorker > 5) {
        suggestions.push({
          type: 'load-limit',
          description: `Detected high task load (${avgTasksPerWorker.toFixed(1)} tasks per worker). Consider adding a capacity limit rule.`,
          confidence: 0.8,
          ruleData: { maxTasksPerWorker: Math.ceil(avgTasksPerWorker * 0.8) }
        });
      }
    }
    
    return suggestions;
  }

  private analyzeSkillGaps(data: any): AIRuleSuggestion[] {
    // Implementation for skill gap analysis
    return [];
  }

  private analyzePriorityPatterns(data: any): AIRuleSuggestion[] {
    const suggestions: AIRuleSuggestion[] = [];
    
    if (data.tasks.length > 0) {
      const urgentTasks = data.tasks.filter((task: any) => 
        String(task.priority || '').toLowerCase() === 'urgent'
      );
      
      if (urgentTasks.length > data.tasks.length * 0.3) {
        suggestions.push({
          type: 'precedence-override',
          description: `High number of urgent tasks (${urgentTasks.length}). Consider implementing priority escalation rules.`,
          confidence: 0.75,
          ruleData: { priorityThreshold: 'urgent', action: 'escalate' }
        });
      }
    }
    
    return suggestions;
  }

  private extractEntitiesFromText(text: string): string[] {
    // Simple entity extraction - in practice, this would use NLP
    const words = text.toLowerCase().split(/\s+/);
    const entities = [];
    
    if (words.includes('task') || words.includes('tasks')) entities.push('task');
    if (words.includes('worker') || words.includes('workers')) entities.push('worker');
    if (words.includes('client') || words.includes('clients')) entities.push('client');
    
    return entities;
  }

  private extractNumberFromText(text: string): number | null {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  private extractPriorityCondition(text: string): string {
    const textLower = text.toLowerCase();
    if (textLower.includes('urgent')) return 'priority = urgent';
    if (textLower.includes('high')) return 'priority = high';
    if (textLower.includes('important')) return 'priority >= high';
    return 'priority = high';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private suggestEmailCorrection(email: string): string {
    // Common email corrections
    let corrected = email.toLowerCase().trim();
    
    // Fix common domain typos
    corrected = corrected.replace(/gmail\.co$/, 'gmail.com');
    corrected = corrected.replace(/yahoo\.co$/, 'yahoo.com');
    corrected = corrected.replace(/\.con$/, '.com');
    
    // Remove extra spaces
    corrected = corrected.replace(/\s+/g, '');
    
    return corrected;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for 10-digit US numbers
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // Format as +X (XXX) XXX-XXXX for 11-digit numbers
    if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    
    return phone; // Return original if can't format
  }

  private standardizeStatus(status: string, entityType: 'client' | 'worker' | 'task'): string {
    const statusLower = status.toLowerCase().trim();
    
    const statusMaps = {
      client: {
        'active': ['active', 'enabled', 'current', 'live'],
        'inactive': ['inactive', 'disabled', 'suspended', 'off'],
        'pending': ['pending', 'waiting', 'processing', 'review']
      },
      worker: {
        'available': ['available', 'ready', 'free', 'open'],
        'busy': ['busy', 'occupied', 'working', 'assigned'],
        'offline': ['offline', 'unavailable', 'away', 'off']
      },
      task: {
        'pending': ['pending', 'new', 'created', 'waiting'],
        'in-progress': ['in-progress', 'active', 'working', 'started'],
        'completed': ['completed', 'done', 'finished', 'closed'],
        'cancelled': ['cancelled', 'canceled', 'aborted', 'stopped']
      }
    };
    
    const mappings = statusMaps[entityType];
    for (const [standard, variants] of Object.entries(mappings)) {
      if (variants.includes(statusLower)) {
        return standard;
      }
    }
    
    return status; // Return original if no mapping found
  }
}

export const aiService = AIService.getInstance();
