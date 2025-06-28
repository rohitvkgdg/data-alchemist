# 📊 Data Alchemist [Live Link] (https://alchemist.rohitvk.site/)

A modern, AI-powered data management and analytics platform built with Next.js, TypeScript, and cutting-edge web technologies. Transform your CSV and Excel files into actionable insights with validation, rule-based processing, and natural language queries.

## 🌟 Features

### 📁 **Smart File Processing**
- **Drag & Drop Upload**: Intuitive file upload with support for CSV and Excel formats
- **Real-time Validation**: Instant data validation with Zod schemas
- **Error Highlighting**: Visual indicators for invalid records with detailed error messages
- **Progress Tracking**: Live upload progress and processing status

### 🔧 **Data Management**
- **Inline Editing**: Edit data directly in the table with live validation
- **Multi-format Export**: Export processed data as CSV, Excel, or JSON
- **Data Types**: Support for Clients, Workers, and Tasks with custom schemas
- **Field Completeness**: Track and visualize data quality metrics

### 🤖 **AI-Powered Assistant**
- **Natural Language Queries**: Ask questions about your data in plain English
- **Floating Interface**: Always-accessible AI assistant from any page
- **Smart Responses**: Get instant insights about status distributions, completion rates, and validation errors
- **Contextual Suggestions**: Receive relevant query suggestions based on your data

### ⚙️ **Rule Engine**
- **Validation Rules**: Define custom validation criteria for data quality
- **Transformation Rules**: Automatically transform and standardize data formats
- **Filter & Sort Rules**: Apply business logic to organize your data
- **Priority System**: Control rule execution order with priority levels
- **Rule Export**: Save and share rule configurations as JSON

### 📊 **Advanced Analytics**
- **Interactive Dashboards**: Comprehensive overview of your data metrics
- **Trend Analysis**: Visualize patterns and trends across different data types
- **Status Distribution**: Pie charts and bar graphs for categorical data
- **Field Completeness**: Track missing data and completeness rates
- **Real-time Updates**: Analytics update automatically as you modify data

### 🎨 **Modern UI/UX**
- **shadcn/ui Components**: Beautiful, accessible component library
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Toast Notifications**: Real-time feedback for all user actions
- **Keyboard Shortcuts**: Efficient navigation and data entry

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Data Validation**: Zod
- **File Processing**: Papa Parse, XLSX
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Installation(Use bun or npm)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/data-alchemist.git
   cd data-alchemist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Quick Start

1. **Upload Your Data**
   - Click on any data type tab (Clients, Workers, Tasks)
   - Drag and drop your CSV or Excel file
   - Watch as the data is automatically validated and processed

2. **Explore Your Data**
   - Use the table view to edit records inline
   - Switch to analytics view for visual insights
   - Check the validation summary for data quality metrics

3. **Ask AI Questions**
   - Click the floating chat button in the bottom-right corner
   - Ask questions like "How many active clients do we have?"
   - Get instant insights about your data

4. **Create Rules**
   - Go to the Rules tab to define data processing rules
   - Set validation criteria, transformations, and filters
   - Export your rule configurations for reuse

## 📋 Data Formats

### Client Data
```csv
id,name,email,phone,company,status,address
1,John Doe,john@example.com,+1234567890,Acme Corp,active,123 Main St
```

### Worker Data
```csv
id,name,email,phone,hourlyRate,availability,status,department
1,Jane Smith,jane@example.com,+1987654321,75,full-time,active,Engineering
```

### Task Data
```csv
id,title,description,assignedTo,status,priority,dueDate,estimatedHours
1,Update Website,Redesign homepage,john@example.com,in-progress,high,2024-12-31,40
```

## 🎨 Key Components

### Data Workspace
- **Multi-tab Interface**: Separate views for different data types
- **Editable Data Grid**: Built with TanStack Table for performance
- **Export Functionality**: Multiple format support with error handling

### Analytics Dashboard
- **Overview Tab**: Key metrics and summary statistics
- **Trends Tab**: Time-series analysis and pattern recognition
- **Correlations Tab**: Cross-dataset relationship analysis
- **Predictions Tab**: Future trend forecasting (placeholder)

### AI Query Interface
- **Natural Language Processing**: Understands common business questions
- **Contextual Responses**: Provides relevant insights based on current data
- **Interactive Chat**: Persistent conversation history

### Rule Engine
- **Visual Rule Builder**: Intuitive interface for creating business rules
- **Rule Categories**: Validation, transformation, filtering, and sorting
- **Priority Management**: Control execution order and rule conflicts

## 🔧 Configuration

The application uses TypeScript interfaces and Zod schemas for data validation:

```typescript
// Client schema example
const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
  // ... more fields
});
```

## 🎨 Customization

### Adding New Data Types
1. Define TypeScript interface in `types/data-models.ts`
2. Create Zod schema for validation
3. Add columns definition in `lib/table-columns.tsx`
4. Update the data store in `store/data-store.ts`

## 📱 Mobile Responsiveness

- **Adaptive Layout**: Components adjust to screen size automatically
- **Touch-friendly**: Optimized for mobile interactions
- **Progressive Enhancement**: Core functionality works on all devices

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

The application is optimized for deployment on Vercel, Netlify, or any VPS hosting.

## Highlights of this project

This project was built as a demonstration of modern React development practices and full-stack application architecture. It showcases:

- **Clean Code Architecture**: Modular components and clear separation of concerns
- **Type Safety**: Comprehensive TypeScript usage throughout the application
- **Modern React Patterns**: Hooks, context, and state management best practices
- **Performance Optimization**: Code splitting and efficient rendering
- **User Experience**: Intuitive design and responsive interactions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

Built by Rohit Kulkarni as part of an internship application.

**Key Skills Demonstrated:**
- Full-stack React/Next.js development
- TypeScript and modern JavaScript
- State management and data validation
- UI/UX design with modern component libraries
- File processing and data manipulation
- Real-time user interactions and feedback
- Responsive web design principles

---

*Data Alchemist transforms raw data into golden insights. Experience the magic of intelligent data processing.* ✨

## Deployment


