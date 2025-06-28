import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Trash2, Edit3 } from 'lucide-react';
import { Rule, RuleSchema } from '@/types/data-models';
import { toast } from 'sonner';

interface RuleBuilderProps {
  onRulesChange?: (rules: Rule[]) => void;
}

export function RuleBuilder({ onRulesChange }: RuleBuilderProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [currentRule, setCurrentRule] = useState<Partial<Rule>>({
    type: 'co-run',
    name: '',
    description: '',
    priority: 1,
    isActive: true,
    parameters: {}
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const ruleTypes = [
    { value: 'co-run', label: 'Co-run Tasks', description: 'Tasks that must run together' },
    { value: 'slot-restriction', label: 'Slot Restriction', description: 'Minimum common slots for groups' },
    { value: 'load-limit', label: 'Load Limit', description: 'Maximum slots per phase for worker group' },
    { value: 'phase-window', label: 'Phase Window', description: 'Allowed phases for specific tasks' },
    { value: 'pattern-match', label: 'Pattern Match', description: 'Regex-based rule matching' },
    { value: 'precedence-override', label: 'Precedence Override', description: 'Rule priority override' }
  ];

  const addRule = () => {
    try {
      const ruleWithId = {
        ...currentRule,
        id: `rule-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const validatedRule = RuleSchema.parse(ruleWithId);
      
      if (editingIndex !== null) {
        const updatedRules = [...rules];
        updatedRules[editingIndex] = validatedRule;
        setRules(updatedRules);
        setEditingIndex(null);
        toast.success('Rule updated successfully');
      } else {
        const newRules = [...rules, validatedRule];
        setRules(newRules);
        toast.success('Rule added successfully');
      }

      // Reset form
      setCurrentRule({
        type: 'co-run',
        name: '',
        description: '',
        priority: 1,
        isActive: true,
        parameters: {}
      });

      onRulesChange?.(editingIndex !== null ? rules : [...rules, validatedRule]);
    } catch (error) {
      toast.error('Invalid rule configuration');
    }
  };

  const editRule = (index: number) => {
    setCurrentRule(rules[index]);
    setEditingIndex(index);
  };

  const deleteRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    onRulesChange?.(updatedRules);
    toast.success('Rule deleted');
  };

  const downloadRulesConfig = () => {
    const config = {
      rules,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Rules configuration downloaded');
  };

  const renderParametersForm = () => {
    switch (currentRule.type) {
      case 'co-run':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskIds">Task IDs (comma-separated)</Label>
              <Input
                id="taskIds"
                placeholder="T001,T002,T003"
                value={currentRule.parameters?.taskIds || ''}
                onChange={(e) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, taskIds: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      case 'slot-restriction':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupType">Group Type</Label>
              <Select 
                value={currentRule.parameters?.groupType || 'client'}
                onValueChange={(value) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, groupType: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client Group</SelectItem>
                  <SelectItem value="worker">Worker Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="groupTag">Group Tag</Label>
              <Input
                id="groupTag"
                placeholder="enterprise, startup, etc."
                value={currentRule.parameters?.groupTag || ''}
                onChange={(e) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, groupTag: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="minCommonSlots">Minimum Common Slots</Label>
              <Input
                id="minCommonSlots"
                type="number"
                min="1"
                value={currentRule.parameters?.minCommonSlots || ''}
                onChange={(e) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, minCommonSlots: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>
        );

      case 'load-limit':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="workerGroup">Worker Group</Label>
              <Input
                id="workerGroup"
                placeholder="frontend, backend, etc."
                value={currentRule.parameters?.workerGroup || ''}
                onChange={(e) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, workerGroup: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="maxSlotsPerPhase">Max Slots Per Phase</Label>
              <Input
                id="maxSlotsPerPhase"
                type="number"
                min="1"
                value={currentRule.parameters?.maxSlotsPerPhase || ''}
                onChange={(e) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, maxSlotsPerPhase: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>
        );

      case 'phase-window':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskId">Task ID</Label>
              <Input
                id="taskId"
                placeholder="T001"
                value={currentRule.parameters?.taskId || ''}
                onChange={(e) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, taskId: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="allowedPhases">Allowed Phases (comma-separated or range)</Label>
              <Input
                id="allowedPhases"
                placeholder="1,2,3 or 1-5"
                value={currentRule.parameters?.allowedPhases || ''}
                onChange={(e) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, allowedPhases: e.target.value }
                })}
              />
            </div>
          </div>
        );

      case 'pattern-match':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pattern">Regex Pattern</Label>
              <Input
                id="pattern"
                placeholder="^T[0-9]{3}$"
                value={currentRule.parameters?.pattern || ''}
                onChange={(e) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, pattern: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="action">Action</Label>
              <Select
                value={currentRule.parameters?.action || 'restrict'}
                onValueChange={(value) => setCurrentRule({
                  ...currentRule,
                  parameters: { ...currentRule.parameters, action: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restrict">Restrict</SelectItem>
                  <SelectItem value="allow">Allow</SelectItem>
                  <SelectItem value="prioritize">Prioritize</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Business Rules</h2>
          <p className="text-muted-foreground">Create and manage resource allocation rules</p>
        </div>
        <Button onClick={downloadRulesConfig} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Rules Config
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Builder Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editingIndex !== null ? 'Edit Rule' : 'Create New Rule'}</CardTitle>
            <CardDescription>Configure business rules for resource allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ruleType">Rule Type</Label>
              <Select 
                value={currentRule.type}
                onValueChange={(value: any) => setCurrentRule({
                  ...currentRule,
                  type: value,
                  parameters: {} // Reset parameters when type changes
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ruleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input
                id="ruleName"
                placeholder="Enter rule name"
                value={currentRule.name}
                onChange={(e) => setCurrentRule({ ...currentRule, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="ruleDescription">Description (optional)</Label>
              <Textarea
                id="ruleDescription"
                placeholder="Describe the rule's purpose"
                value={currentRule.description}
                onChange={(e) => setCurrentRule({ ...currentRule, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={currentRule.priority}
                onChange={(e) => setCurrentRule({ ...currentRule, priority: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={currentRule.isActive}
                onCheckedChange={(checked) => setCurrentRule({ ...currentRule, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            {renderParametersForm()}

            <div className="flex gap-2">
              <Button onClick={addRule} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                {editingIndex !== null ? 'Update Rule' : 'Add Rule'}
              </Button>
              {editingIndex !== null && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingIndex(null);
                    setCurrentRule({
                      type: 'co-run',
                      name: '',
                      description: '',
                      priority: 1,
                      isActive: true,
                      parameters: {}
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rules List */}
        <Card>
          <CardHeader>
            <CardTitle>Current Rules ({rules.length})</CardTitle>
            <CardDescription>Manage existing rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No rules configured yet</p>
              ) : (
                rules.map((rule, index) => (
                  <div key={rule.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{rule.type}</Badge>
                        </div>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Priority: {rule.priority}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editRule(index)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteRule(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
