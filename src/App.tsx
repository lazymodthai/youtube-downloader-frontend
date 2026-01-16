import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import YouTubeDownloader from "./components/YouTubeDownloader"
import History from "./components/History"
import Header from "./components/Header"
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Prompt", "Inter", "system-ui", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<YouTubeDownloader />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App

