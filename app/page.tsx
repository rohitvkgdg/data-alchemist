"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';

export default function Home() {
  return (
    <AppLayout>
      <div className="w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Upload Your Data</h1>
          <p className="text-muted-foreground">
            Choose the type of data you want to upload and select your file
          </p>
        </div>

        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Client Data
                </CardTitle>
                <CardDescription>
                  Upload your CSV or Excel file containing client information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload dataType="clients" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Worker Data
                </CardTitle>
                <CardDescription>
                  Upload your CSV or Excel file containing worker information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload dataType="workers" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Task Data
                </CardTitle>
                <CardDescription>
                  Upload your CSV or Excel file containing task information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload dataType="tasks" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
