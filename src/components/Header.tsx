import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Stack, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { YouTube as YouTubeIcon, History as HistoryIcon, Home as HomeIcon } from '@mui/icons-material';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="sticky" sx={{ background: 'white', color: 'text.primary', boxShadow: 1 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1} component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            <YouTubeIcon sx={{ color: 'error.main', fontSize: 32 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ display: { xs: 'none', sm: 'block' } }}>
              YT Downloader
            </Typography>
          </Stack>

          <Box>
            <Button
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon />}
              color={location.pathname === '/' ? 'primary' : 'inherit'}
              sx={{ mr: 1 }}
            >
              หน้าแรก
            </Button>
            <Button
              component={RouterLink}
              to="/history"
              startIcon={<HistoryIcon />}
              color={location.pathname === '/history' ? 'primary' : 'inherit'}
            >
              ประวัติ
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
