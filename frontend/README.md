# AI Data Analyst - React Application

A modern, AI-powered data analysis tool with a stunning dark theme interface inspired by Google's Gemini. Upload datasets and get intelligent insights, visualizations, and analysis through natural language queries.

## ✨ Features

- **Modern Dark UI**: Sleek, spacious design with premium aesthetics
- **Drag & Drop Upload**: Easy dataset upload with visual feedback
- **AI-Powered Analysis**: Natural language queries for data insights
- **Rich Visualizations**: Automated charts and data visualizations
- **Interactive Tables**: Beautiful data tables with sorting and filtering
- **Real-time Chat**: Smooth chat experience with typing indicators
- **Responsive Design**: Works perfectly on all screen sizes

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Components**: Shadcn/ui component library
- **Icons**: Lucide React
- **File Upload**: React Dropzone
- **HTTP Client**: Axios
- **State Management**: React hooks

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-data-analyst
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:3001
   
   # Optional: Development settings
   VITE_DEV_MODE=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ChatInput.tsx       # Message input with send functionality
│   ├── ChatMessage.tsx     # Individual message display
│   ├── ChatPanel.tsx       # Main chat interface
│   ├── Sidebar.tsx         # Navigation and upload controls
│   ├── UploadModal.tsx     # File upload modal
│   └── ui/                 # Shadcn/ui components
├── hooks/
│   └── use-toast.ts        # Toast notification hook
├── pages/
│   └── Index.tsx           # Main application page
├── lib/
│   └── utils.ts            # Utility functions
├── index.css              # Global styles and design tokens
└── main.tsx              # Application entry point
```

## 🎨 Design System

The application uses a custom dark theme with carefully crafted design tokens:

- **Primary**: Purple gradient (`#A855F7` to `#C084FC`)
- **Background**: Deep dark grays (`#0F172A`, `#1E293B`)
- **Cards**: Subtle dark cards with transparency
- **Borders**: Soft borders with low opacity
- **Text**: High contrast white and gray scales

## 🔌 API Integration

The application expects a backend API with these endpoints:

### Upload Dataset
```http
POST /api/upload
Content-Type: multipart/form-data

Body: FormData with 'file' field containing .zip file
```

### Query Data
```http
POST /api/query
Content-Type: application/json

{
  "query": "What is the average temperature by room?"
}
```

**Response Format:**
```json
{
  "summary": "Natural language explanation of the analysis...",
  "table": {
    "headers": ["Column 1", "Column 2"],
    "rows": [["Value 1", "Value 2"], ["Value 3", "Value 4"]]
  },
  "visualizationUrl": "/api/viz/chart-123.png"
}
```

## 🎯 User Experience Flow

1. **Initial State**: Chat is disabled, welcome card is displayed
2. **Upload**: User clicks "Upload Dataset" to open modal
3. **Drag & Drop**: User drags .zip file or clicks to browse
4. **Processing**: Upload progress with visual feedback
5. **Activation**: Chat becomes enabled, success toast appears
6. **Analysis**: User can now send natural language queries
7. **Results**: AI responds with summaries, tables, and visualizations

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Component Guidelines

- Use semantic design tokens from `index.css`
- Follow the established dark theme patterns
- Implement proper loading states and error handling
- Ensure responsive design across all components
- Use TypeScript for type safety

### Custom Hooks

- `useToast()` - For notification management
- `useIsMobile()` - For responsive design detection

## 🎨 Customization

### Colors
Modify the design tokens in `src/index.css`:
```css
:root {
  --primary: 263 86% 66%;          /* Purple */
  --background: 222.2 84% 4.9%;    /* Dark background */
  --chat-bg: 220 13% 8%;           /* Chat area background */
  /* ... other tokens */
}
```

### Animations
The app includes smooth animations defined in `tailwind.config.ts`:
- Fade in/out transitions
- Scale animations for modals
- Smooth hover effects
- Loading indicators

## 🔧 Troubleshooting

### Common Issues

1. **Upload fails**: Check API endpoint and file format (.zip only)
2. **Styling issues**: Ensure Tailwind CSS is properly configured
3. **Type errors**: Verify all interfaces match API responses
4. **Performance**: Implement virtualization for large datasets

### Development Tips

- Use React DevTools for debugging
- Check browser console for API errors
- Test with various file sizes and formats
- Verify responsive design on different screens

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ using React, TypeScript, and modern web technologies.