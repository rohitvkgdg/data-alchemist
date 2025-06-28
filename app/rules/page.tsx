"use client";

import { AppLayout } from "@/components/app-layout";
import { RuleEngine } from '@/components/rules/rule-engine';

export default function RulesPage() {
  return (
    <AppLayout>
      <div className="w-full space-y-6">
        <RuleEngine />
      </div>
    </AppLayout>
  );
}
