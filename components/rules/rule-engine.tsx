"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Code2, 
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Download
} from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  description: string;
  dataType: 'clients' | 'workers' | 'tasks';
  ruleType: 'validation' | 'transformation' | 'filter' | 'sort';
  field: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
}

const RULE_TYPES = [
  { value: 'validation', label: 'Validation', icon: CheckCircle, description: 'Validate data quality' },
  { value: 'transformation', label: 'Transform', icon: Code2, description: 'Transform field values' },
  { value: 'filter', label: 'Filter', icon: Filter, description: 'Filter records' },
  { value: 'sort', label: 'Sort', icon: ArrowUpDown, description: 'Sort data' }
];

const CONDITIONS = {
  validation: ['required', 'email', 'phone', 'numeric', 'date', 'length', 'pattern'],
  transformation: ['uppercase', 'lowercase', 'trim', 'replace', 'format', 'calculate'],
  filter: ['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than'],
  sort: ['ascending', 'descending', 'custom']
};

export function RuleEngine() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    dataType: 'clients',
    ruleType: 'validation',
    priority: 1,
    isActive: true
  });

  const getFieldsForDataType = (dataType: string) => {
    switch (dataType) {
      case 'clients':
        return ['name', 'email', 'phone', 'company', 'status', 'registrationDate'];
      case 'workers':
        return ['name', 'email', 'phone', 'department', 'position', 'hourlyRate', 'availability'];
      case 'tasks':
        return ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate', 'estimatedHours'];
      default:
        return [];
    }
  };

  const handleAddRule = () => {
    if (newRule.name && newRule.field && newRule.condition && newRule.action) {
      const rule: Rule = {
        id: Date.now().toString(),
        name: newRule.name!,
        description: newRule.description || '',
        dataType: newRule.dataType!,
        ruleType: newRule.ruleType!,
        field: newRule.field!,
        condition: newRule.condition!,
        action: newRule.action!,
        priority: newRule.priority || 1,
        isActive: newRule.isActive ?? true,
        createdAt: new Date()
      };

      setRules(prev => [...prev, rule].sort((a, b) => a.priority - b.priority));
      setNewRule({
        dataType: 'clients',
        ruleType: 'validation',
        priority: 1,
        isActive: true
      });
      setShowAddRule(false);
      
      toast.success('Rule created successfully!', {
        description: `"${rule.name}" has been added to your active rules.`
      });
    } else {
      toast.error('Missing required fields', {
        description: 'Please fill in all required fields to create a rule.'
      });
    }
  };

  const handleDeleteRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    setRules(prev => prev.filter(rule => rule.id !== id));
    
    if (rule) {
      toast.success('Rule deleted', {
        description: `"${rule.name}" has been removed from your rules.`
      });
    }
  };

  const handleToggleRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
    
    if (rule) {
      toast.success(
        rule.isActive ? 'Rule deactivated' : 'Rule activated',
        {
          description: `"${rule.name}" is now ${rule.isActive ? 'inactive' : 'active'}.`
        }
      );
    }
  };

  const exportRules = () => {
    if (rules.length === 0) {
      toast.error('No rules to export', {
        description: 'Create some rules first before exporting.'
      });
      return;
    }

    try {
      const rulesJson = JSON.stringify(rules, null, 2);
      const blob = new Blob([rulesJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data-rules.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Rules exported successfully!', {
        description: `${rules.length} rules exported to data-rules.json`
      });
    } catch {
      toast.error('Export failed', {
        description: 'There was an error exporting your rules.'
      });
    }
  };

  const activeRules = rules.filter(rule => rule.isActive);
  const inactiveRules = rules.filter(rule => !rule.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rule Engine</h2>
          <p className="text-muted-foreground">
            Define validation, transformation, and filtering rules for your data
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={exportRules} variant="outline" disabled={rules.length === 0} className="w-full sm:w-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Rules</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button onClick={() => setShowAddRule(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Rule Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Rules</p>
                <p className="text-xl sm:text-2xl font-bold">{rules.length}</p>
              </div>
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{activeRules.length}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Validation Rules</p>
                <p className="text-xl sm:text-2xl font-bold">{rules.filter(r => r.ruleType === 'validation').length}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Transform Rules</p>
                <p className="text-xl sm:text-2xl font-bold">{rules.filter(r => r.ruleType === 'transformation').length}</p>
              </div>
              <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Rule Form */}
      {showAddRule && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Rule</CardTitle>
            <CardDescription>
              Create a new rule to process your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input
                    id="ruleName"
                    placeholder="Enter rule name"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="100"
                    value={newRule.priority || 1}
                    onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataType">Data Type</Label>
                  <Select
                    value={newRule.dataType}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, dataType: value as 'clients' | 'workers' | 'tasks', field: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clients">Clients</SelectItem>
                      <SelectItem value="workers">Workers</SelectItem>
                      <SelectItem value="tasks">Tasks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ruleType">Rule Type</Label>
                  <Select
                    value={newRule.ruleType}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, ruleType: value as Rule['ruleType'], condition: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{type.label}</span>
                            <span className="sm:hidden">{type.label.slice(0, 8)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="field">Field</Label>
                  <Select
                    value={newRule.field}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, field: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFieldsForDataType(newRule.dataType!).map(field => (
                        <SelectItem key={field} value={field}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={newRule.condition}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS[newRule.ruleType!]?.map(condition => (
                        <SelectItem key={condition} value={condition}>
                          {condition.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                placeholder="Enter action (e.g., 'mark as invalid', 'convert to uppercase')"
                value={newRule.action || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                className='resize-none'
                placeholder="Describe what this rule does"
                value={newRule.description || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                draggable={false}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setShowAddRule(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleAddRule} className="w-full sm:w-auto">
                Add Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="text-xs sm:text-sm">
            Active ({activeRules.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="text-xs sm:text-sm">
            Inactive ({inactiveRules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeRules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No Active Rules</p>
                  <p>Create rules to validate, transform, and filter your data</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                      <div className="space-y-1">
                        <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2">
                          {(() => {
                            const ruleType = RULE_TYPES.find(t => t.value === rule.ruleType);
                            const IconComponent = ruleType?.icon;
                            return IconComponent ? <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" /> : null;
                          })()}
                          <span className="break-all">{rule.name}</span>
                          <Badge variant="secondary" className="text-xs">Priority {rule.priority}</Badge>
                          <Badge variant={rule.isActive ? "default" : "secondary"} className="text-xs">
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">{rule.description || 'No description'}</CardDescription>
                      </div>
                      <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleRule(rule.id)}
                          className="text-xs px-2 py-1 h-8"
                        >
                          <span className="hidden sm:inline">{rule.isActive ? "Deactivate" : "Activate"}</span>
                          <span className="sm:hidden">{rule.isActive ? "Off" : "On"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="px-2 py-1 h-8"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Data Type</Label>
                        <p className="font-medium capitalize text-xs sm:text-sm">{rule.dataType}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Field</Label>
                        <p className="font-medium text-xs sm:text-sm break-all">{rule.field}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Condition</Label>
                        <p className="font-medium text-xs sm:text-sm">{rule.condition.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Action</Label>
                        <p className="font-medium text-xs sm:text-sm break-all">{rule.action}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveRules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No Inactive Rules</p>
                  <p>All your rules are currently active</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {inactiveRules.map((rule) => (
                <Card key={rule.id} className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                      <div className="space-y-1">
                        <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2">
                          {(() => {
                            const ruleType = RULE_TYPES.find(t => t.value === rule.ruleType);
                            const IconComponent = ruleType?.icon;
                            return IconComponent ? <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" /> : null;
                          })()}
                          <span className="break-all">{rule.name}</span>
                          <Badge variant="secondary" className="text-xs">Priority {rule.priority}</Badge>
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">{rule.description || 'No description'}</CardDescription>
                      </div>
                      <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleRule(rule.id)}
                          className="text-xs px-2 py-1 h-8"
                        >
                          <span className="hidden sm:inline">Activate</span>
                          <span className="sm:hidden">On</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="px-2 py-1 h-8"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Data Type</Label>
                        <p className="font-medium capitalize text-xs sm:text-sm">{rule.dataType}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Field</Label>
                        <p className="font-medium text-xs sm:text-sm break-all">{rule.field}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Condition</Label>
                        <p className="font-medium text-xs sm:text-sm">{rule.condition.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Action</Label>
                        <p className="font-medium text-xs sm:text-sm break-all">{rule.action}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      {rules.length === 0 && !showAddRule && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Getting Started:</strong> Rules help you automatically validate, transform, and filter your data. 
            Start by creating a validation rule to ensure data quality, or add transformation rules to standardize your data format.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
