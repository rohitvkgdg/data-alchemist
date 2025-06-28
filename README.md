# 📊 Data Alchemist [Live Link](https://alchemist.rohitvk.site/)

A comprehensive AI-powered resource allocation and data validation platform built with Next.js, TypeScript, and modern web technologies. Designed for managing complex relationships between clients, workers, and tasks with sophisticated validation rules and business logic.

## 🎯 Project Overview

Data Alchemist is a specialized web application for managing and validating resource allocation data, featuring advanced validation systems, business rule engines, and AI-powered insights. Built for non-technical users who need to manage complex data relationships and ensure data integrity across multiple interconnected entities.

## 🌟 Core Features Implemented

### �️ **Data Ingestion & Management**
- **Multi-format Upload**: Support for CSV and XLSX files for clients, workers, and tasks
- **Intelligent Parsing**: Advanced file parsing with schema validation and transformation
- **Data Grid Display**: Interactive tables with inline editing capabilities
- **Validation Engine**: Comprehensive 12+ validation rules with real-time feedback
- **Error Highlighting**: Visual indicators for validation errors with detailed summaries
- **Progress Tracking**: Live upload progress and processing status

### ✅ **Core Validation System (12 Validations Implemented)**
1. **Missing Required Columns**: Validates presence of mandatory fields (ClientID, WorkerID, TaskID, etc.)
2. **Duplicate IDs**: Detects and reports duplicate identifiers across all entity types
3. **Malformed Lists**: Validates array formats (AvailableSlots, PreferredPhases, Skills)
4. **Out-of-Range Values**: Ensures PriorityLevel (1-5), Duration (≥1), hourly rates, etc.
5. **Broken JSON**: Validates JSON format in AttributesJSON and metadata fields
6. **Unknown References**: Validates RequestedTaskIDs, assignedTo, and clientId references
7. **Circular Dependencies**: Detects circular task dependencies (A→B→C→A)
8. **Rule vs Constraint Conflicts**: Validates business rules against phase-window constraints
9. **Worker Overload**: Checks AvailableSlots.length vs MaxLoadPerPhase capacity
10. **Phase-Slot Saturation**: Ensures total task durations ≤ available worker slots per phase
11. **Skill Coverage Matrix**: Verifies every RequiredSkill maps to at least one worker
12. **Max-Concurrency Feasibility**: Validates MaxConcurrent ≤ qualified available workers

### ⚙️ **Business Rule Engine**
- **6 Rule Types**: Co-run, Slot-restriction, Load-limit, Phase-window, Pattern-match, Precedence-override
- **Visual Rule Builder**: Intuitive interface for creating complex business rules
- **Parameter Configuration**: Dynamic forms based on rule type selection
- **Priority Management**: Rule execution order and conflict resolution
- **Rule Validation**: Real-time validation of rule parameters
- **Export System**: Generate clean `rules.json` configuration files

### 🎛️ **Prioritization & Weights Interface**
- **Criteria Weighting**: Sliders and numeric inputs for importance weights
- **Resource Allocation**: PriorityLevel, task fulfillment, fairness metrics
- **Export Functionality**: Download validated data sheets and rules configuration
- **Multi-sheet Export**: Separate sheets for clients, workers, tasks with rules.json

### 🤖 **AI-Enhanced Features**
- **Smart Header Mapping**: AI-powered mapping of misnamed or rearranged columns
- **Data Validation Assistant**: Broader validation beyond core requirements
- **Natural Language Queries**: Plain English data retrieval and modification
- **Data Correction Suggestions**: AI-powered fixes for validation gaps
- **Rule Recommendations**: Pattern detection and suggested business rules
- **Natural Language Rule Input**: Convert plain English to structured rules

### 📊 **Analytics & Visualization**
- **Comprehensive Dashboards**: Real-time metrics and validation summaries
- **Field Completeness Tracking**: Visual indicators for data quality
- **Status Distribution Charts**: Interactive visualizations for categorical data
- **Validation Rate Monitoring**: Track data quality improvements over time
- **Cross-Entity Analytics**: Relationship analysis between clients, workers, and tasks

## 🏗️ Data Entity Structure & Relationships

### 👥 **Clients**
- `ClientID`: Unique identifier for each client
- `ClientName`: Client organization name  
- `PriorityLevel`: Integer 1-5 indicating request importance
- `RequestedTaskIDs`: Comma-separated list of requested task identifiers
- `GroupTag`: Client categorization (enterprise, startup, etc.)
- `AttributesJSON`: Flexible JSON metadata for client-specific attributes

### 👨‍� **Workers**
- `WorkerID`: Unique identifier for each worker
- `WorkerName`: Worker's full name
- `Skills`: Comma-separated list of technical competencies
- `AvailableSlots`: Array of phase numbers when worker is available
- `MaxLoadPerPhase`: Maximum concurrent tasks per phase
- `WorkerGroup`: Team categorization (frontend, backend, etc.)
- `QualificationLevel`: Integer 1-10 representing experience level

### 📋 **Tasks**
- `TaskID`: Unique identifier for each task
- `TaskName`: Descriptive task title
- `Category`: Task classification (development, testing, etc.)
- `Duration`: Number of phases required (≥1)
- `RequiredSkills`: Comma-separated skills needed
- `PreferredPhases`: List or range syntax for timing preferences
- `MaxConcurrent`: Maximum simultaneous worker assignments

### 🔗 **Key Relationships**
- **Clients → Tasks**: RequestedTaskIDs must reference valid TaskIDs
- **Tasks → Workers**: RequiredSkills must exist in worker skill sets
- **Workers → Phases**: AvailableSlots define worker-phase availability
- **Groups**: GroupTag and WorkerGroup enable rule-based restrictions
- **Dependencies**: Tasks can reference other tasks creating execution chains

## �🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui component library
- **State Management**: Zustand for client-side state
- **Data Validation**: Zod schemas with custom transformations
- **File Processing**: Papa Parse (CSV), XLSX library
- **Charts & Analytics**: Recharts for data visualization
- **Icons**: Lucide React icon system
- **Notifications**: Sonner for user feedback
- **AI Features**: Custom natural language processing service

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/data-alchemist.git
   cd data-alchemist
   ```

2. **Install dependencies** (Using Bun or npm)
   ```bash
   bun install
   # or
   npm install
   ```

3. **Run the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Quick Start Guide

### 1. **Data Upload & Validation**
   - Navigate to the main data workspace
   - Select your entity type (Clients, Workers, or Tasks)
   - Drag and drop your CSV or XLSX file
   - Review validation results and error highlights
   - Use inline editing to correct data issues

### 2. **Business Rule Configuration**
   - Go to the Rules page to access the rule builder
   - Choose from 6 rule types (Co-run, Slot-restriction, etc.)
   - Configure rule parameters using the dynamic forms
   - Set priorities and activation status
   - Export your rules configuration as JSON

### 3. **AI-Powered Data Analysis**
   - Use the floating AI chat interface (bottom-right)
   - Ask natural language questions about your data
   - Get suggestions for data corrections and rule optimizations
   - Receive pattern-based rule recommendations

### 4. **Analytics & Export**
   - Switch to Analytics view for visual insights
   - Monitor field completeness and validation rates
   - Export clean, validated data in multiple formats
   - Download rules.json for downstream processing

## 📋 Sample Data Formats

### Client Data Structure
```csv
id,name,priorityLevel,requestedTaskIDs,groupTag,attributesJSON,email,phone,status,address
C001,Acme Corporation,3,"T001,T002",enterprise,"{""budget"":100000,""industry"":""technology""}",john@acme.com,(555) 123-4567,active,"123 Business Ave, NY"
```

### Worker Data Structure  
```csv
id,name,skills,availableSlots,maxLoadPerPhase,workerGroup,qualificationLevel,hourlyRate,availability,status
W001,John Smith,"JavaScript,React,Node.js","[1,2,3]",8,frontend,7,75,full-time,active
```

### Task Data Structure
```csv
id,title,category,duration,requiredSkills,preferredPhases,maxConcurrent,description,status,priority
T001,User Authentication,backend,2,"Node.js,Security","1-3",1,Implement JWT authentication,pending,high
```

## 🧠 AI Features Deep Dive

### **Intelligent Header Mapping**
- Automatically maps misnamed columns to correct data fields
- Handles variations like "Client_ID" → "ClientID", "Worker Name" → "WorkerName"
- Provides confidence scores and reasoning for each mapping suggestion

### **Natural Language Data Interface**
- **Query Examples**: "Show me all high-priority tasks", "Which workers have React skills?"
- **Modification Examples**: "Set all pending tasks to in-progress", "Add Python skill to worker W005"
- **Analysis Examples**: "What's the skill coverage for frontend tasks?"

### **Smart Rule Recommendations**
- Detects patterns like tasks frequently running together → suggests Co-run rules
- Identifies worker overload scenarios → recommends Load-limit rules
- Spots skill gaps → suggests training or hiring recommendations

## 🔧 Advanced Configuration

### Business Rule Types

1. **Co-run Rules**: Define tasks that must execute simultaneously
   ```json
   {
     "type": "co-run",
     "taskIds": ["T001", "T002", "T003"],
     "reason": "Dependent components requiring synchronized deployment"
   }
   ```

2. **Slot-restriction Rules**: Minimum common availability requirements
   ```json
   {
     "type": "slot-restriction", 
     "groupType": "client",
     "groupTag": "enterprise",
     "minCommonSlots": 3
   }
   ```

3. **Load-limit Rules**: Maximum capacity per worker group per phase
   ```json
   {
     "type": "load-limit",
     "workerGroup": "frontend", 
     "maxSlotsPerPhase": 5
   }
   ```

4. **Phase-window Rules**: Restrict tasks to specific execution phases
   ```json
   {
     "type": "phase-window",
     "taskId": "T001",
     "allowedPhases": [1, 2, 3]
   }
   ```

### Validation Configuration

The system supports custom validation schemas with transformations:

```typescript
// Example: Priority level validation with auto-correction
priorityLevel: z.union([z.string(), z.number()]).transform((val) => {
  const num = Number(val);
  return isNaN(num) ? 1 : Math.min(Math.max(num, 1), 5);
}).default(1)
```

## 🚀 Deployment

### Build for Production
```bash
bun run build
# or
npm run build

bun start
# or 
npm start
```

### Deployed Instance
🌐 **Live Demo**: [https://alchemist.rohitvk.site/](https://alchemist.rohitvk.site/)

The application is optimized for deployment on Vercel, Netlify, or any VPS hosting platform.

## 📁 Sample Data & Testing

The `/samples` directory contains comprehensive test data including edge cases:

- **`clients_test.csv`**: 15+ client records with validation scenarios
- **`workers_test.csv`**: 20+ worker profiles with skill matrices  
- **`tasks_test.csv`**: 25+ tasks with complex dependencies

**Edge Cases Included**:
- Duplicate IDs across entities
- Malformed JSON in attributes
- Invalid priority levels and status values
- Circular task dependencies
- Missing required fields
- Out-of-range numeric values

## 🏆 Project Highlights

This application demonstrates sophisticated software engineering practices:

### **Advanced Data Architecture**
- **Complex Entity Relationships**: Multi-table validation with cross-references
- **Flexible Schema Design**: Support for both legacy and modern data formats
- **Real-time Validation**: 12+ comprehensive validation rules with instant feedback
- **Data Transformation Pipeline**: Intelligent parsing and normalization

### **AI-First Design Philosophy**
- **Natural Language Interface**: Plain English queries and data manipulation
- **Intelligent Data Correction**: AI-powered suggestions for validation errors
- **Pattern Recognition**: Automated business rule recommendations
- **Smart Header Mapping**: Handles inconsistent data formats gracefully

### **Enterprise-Grade Features**
- **Business Rule Engine**: Visual rule builder with 6 rule types
- **Resource Allocation Logic**: Phase-based capacity planning and optimization
- **Export Systems**: Multi-format data export with rules configuration
- **Audit Trail**: Comprehensive validation reporting and error tracking

### **Modern Development Stack**
- **Type Safety**: End-to-end TypeScript with Zod validation schemas
- **Performance**: Optimized rendering with TanStack Table and React 19
- **User Experience**: Responsive design with shadcn/ui components
- **Code Quality**: Clean architecture with separation of concerns

## 🎯 Technical Innovation

### **Cross-Entity Validation System**
Implements sophisticated validation logic that checks relationships across multiple data entities:
- Task assignments reference valid workers
- Client requests map to existing tasks  
- Skill requirements have qualified workers
- Phase capacity planning prevents overallocation

### **Dynamic Rule Engine**
Flexible business rule system supporting:
- Co-run constraints for dependent tasks
- Slot restrictions for client/worker groups
- Load limits for capacity management
- Phase windows for timing constraints
- Pattern matching with regex support
- Precedence overrides for rule conflicts

### **AI-Enhanced Workflow**
Integrates artificial intelligence throughout the user journey:
- Proactive error detection and correction suggestions
- Natural language data exploration and modification
- Intelligent rule recommendations based on data patterns
- Adaptive user interface based on data complexity

## 👨‍💻 Developer Information

**Built by**: Rohit Kulkarni  
**Purpose**: Technical demonstration for internship application  
**Focus**: Full-stack development, AI integration, complex data management

**Key Skills Demonstrated**:
- Advanced React/Next.js development with modern patterns
- Complex state management and data validation
- AI/ML integration for enhanced user experience  
- Enterprise-level data processing and validation
- Modern UI/UX design with accessibility considerations
- Performance optimization and scalable architecture

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Data Alchemist: Transforming complex resource allocation data into actionable insights through intelligent validation, sophisticated business rules, and AI-powered analysis.* ✨


