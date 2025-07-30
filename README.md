# 🚀 Live Polling System - Frontend

A modern, real-time polling application built with React, Vite, and Socket.IO. This system allows teachers to create interactive polls and students to participate in real-time with chat functionality.

## ✨ Features

- **Real-time Polling**: Create and manage live polls with instant results
- **Teacher Dashboard**: Comprehensive control panel for managing polls and students
- **Student Interface**: Clean, intuitive interface for participating in polls
- **Live Chat**: Real-time messaging between teachers and students
- **Session Persistence**: Tab-specific session management
- **Auto-reconnection**: Automatic socket reconnection for seamless experience
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS for a beautiful, modern interface

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **Real-time Communication**: Socket.IO Client 4.8.1
- **Routing**: React Router DOM 7.7.1
- **Language**: JavaScript (ES6+)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A running backend server (Socket.IO)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Frontend/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_SOCKET_URL=http://localhost:3001
   VITE_APP_NAME=Live Polling System
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── Components/          # React components
│   ├── Addpoll.jsx     # Teacher dashboard
│   ├── Chat.jsx        # Chat component
│   ├── CreatePoll.jsx  # Poll creation interface
│   ├── EnterName.jsx   # Student name entry
│   ├── Home.jsx        # Landing page
│   ├── Question.jsx    # Poll question display
│   └── ...
├── context/            # React context providers
│   ├── AppContext.jsx  # Global app state
│   └── AppContext_new.jsx
├── hooks/              # Custom React hooks
│   └── useChatOverlay.js
├── services/           # API and socket services
│   └── socketService.js
├── assets/             # Static assets
└── ...
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables for Production

Configure these in your Vercel dashboard:

- `VITE_SOCKET_URL`: Your backend server URL
- `VITE_APP_NAME`: Application name

## 🎯 Usage

### For Teachers

1. **Select "I'm a Teacher"** on the home page
2. **Create a Poll**: Add question, options, and set time limit
3. **Manage Students**: View connected students in real-time
4. **Monitor Responses**: See live poll results as students respond
5. **Chat with Students**: Use the chat feature for real-time communication
6. **End Poll**: Stop the poll and view final results

### For Students

1. **Select "I'm a Student"** on the home page
2. **Enter Your Name**: Provide a unique name for the session
3. **Join Active Poll**: Participate in the teacher's live poll
4. **Submit Answer**: Select your choice and submit
5. **Chat**: Engage with the teacher and other students
6. **View Results**: See poll results after submission

## 🔧 Configuration

### Socket.IO Configuration

The app connects to your backend server via Socket.IO. Configure the connection in `src/services/socketService.js`:

```javascript
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
```

### Styling

This project uses Tailwind CSS. Customize the design by modifying:

- `tailwind.config.js` - Tailwind configuration
- Component-level styles within JSX

## 🐛 Troubleshooting

### Common Issues

1. **Socket Connection Failed**

   - Ensure backend server is running
   - Check VITE_SOCKET_URL environment variable
   - Verify CORS settings on backend

2. **Build Fails**

   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run lint`

3. **Chat Not Working**
   - Verify socket connection
   - Check browser console for errors
   - Ensure backend has chat event handlers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite for lightning-fast development
- Socket.IO for real-time communication
- Tailwind CSS for beautiful styling

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

**Made with ❤️ for interactive learning experiences**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
