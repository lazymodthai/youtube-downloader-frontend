import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  AudioFile as AudioFileIcon,
  VideoFile as VideoFileIcon,
  FlashOn as FlashOnIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  Visibility as VisibilityIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import SummaryModal from './SummaryModal';
import type { SummaryResponse } from '../types';

interface VideoInfo {
  title: string;
  author: string;
  lengthSeconds: number;
  viewCount: number;
  thumbnailUrl: string;
}

const YouTubeDownloader: React.FC = () => {
  const [videoLink, setVideoLink] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'video' | 'audio'>('video');
  const [downloadProgress, setDownloadProgress] = useState<string>('');

  // Summary states
  const [summaryModalOpen, setSummaryModalOpen] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const backendUrl = `http://${window.location.hostname}:4000`;

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handleFetchInfo = async () => {
    if (!videoLink.trim()) {
      setError('กรุณาใส่ลิงก์วิดีโอ YouTube');
      return;
    }

    setLoading(true);
    setError(null);
    setVideoInfo(null);
    setDownloadProgress('');

    try {
      const response = await fetch(`${backendUrl}/video-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoLink }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาด');
      }

      const data = await response.json();
      setVideoInfo(data);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถดึงข้อมูลวิดีโอได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadType: 'normal' | 'fast' = 'normal') => {
    if (!videoInfo) {
      setError('กรุณาดึงข้อมูลวิดีโอก่อน');
      return;
    }

    setLoading(true);
    setError(null);
    setDownloadProgress('กำลังเตรียมดาวน์โหลด...');

    try {
      let endpoint = '';
      let filename = '';

      if (downloadType === 'fast') {
        endpoint = `${backendUrl}/download-fast?videoLink=${encodeURIComponent(videoLink)}`;
        filename = `${videoInfo.title}.mp4`;
        setDownloadProgress('กำลังดาวน์โหลดแบบเร็ว...');
      } else {
        endpoint = `${backendUrl}/download?videoLink=${encodeURIComponent(videoLink)}&format=${downloadFormat}`;
        filename = downloadFormat === 'audio' ? `${videoInfo.title}.mp3` : `${videoInfo.title}.mp4`;
        setDownloadProgress(downloadFormat === 'audio' ? 'กำลังดาวน์โหลดเสียง...' : 'กำลังดาวน์โหลดวิดีโอ...');
      }

      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาด');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadProgress('ดาวน์โหลดสำเร็จ!');
      setTimeout(() => setDownloadProgress(''), 3000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดาวน์โหลด');
      setDownloadProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!videoLink.trim()) {
      setError('กรุณาใส่ลิงก์วิดีโอ YouTube');
      return;
    }

    setSummaryModalOpen(true);
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryData(null);

    try {
      const response = await fetch(`${backendUrl}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoLink }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาด');
      }

      const data = await response.json();
      setSummaryData(data);
    } catch (err: any) {
      setSummaryError(err.message || 'ไม่สามารถสร้างสรุปเนื้อหาได้');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCloseSummary = () => {
    setSummaryModalOpen(false);
    setSummaryData(null);
    setSummaryError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mb={2}>
          <DownloadIcon sx={{ fontSize: 48, color: 'error.main' }} />
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #e91e63 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            YouTube Downloader
          </Typography>
        </Stack>
        <Typography variant="h6" color="text.secondary">
          ดาวน์โหลดวิดีโอหรือเสียงจาก YouTube ได้ง่ายๆ
        </Typography>
      </Box>

      {/* Main Card */}
      <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        {/* Input Section */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
          <TextField
            fullWidth
            label="วางลิงก์วิดีโอ YouTube ที่นี่"
            variant="outlined"
            value={videoLink}
            onChange={(e) => {
              setVideoLink(e.target.value);
              setError(null);
              setVideoInfo(null);
              setDownloadProgress('');
            }}
            disabled={loading}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleFetchInfo}
            disabled={loading || !videoLink}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <InfoIcon />}
            sx={{
              minWidth: { xs: '100%', md: 150 },
              height: 56,
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? 'กำลังโหลด...' : 'ดึงข้อมูล'}
          </Button>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Progress Alert */}
        {downloadProgress && (
          <Alert
            severity={downloadProgress.includes('สำเร็จ') ? 'success' : 'info'}
            icon={downloadProgress.includes('สำเร็จ') ? <CheckCircleIcon /> : <CircularProgress size={20} />}
            sx={{ mb: 3 }}
          >
            {downloadProgress}
          </Alert>
        )}

        {/* Video Info */}
        {videoInfo && (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                image={videoInfo.thumbnailUrl}
                alt={videoInfo.title}
                sx={{ maxHeight: 400, objectFit: 'contain' }}
              />
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {videoInfo.title}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                  <Chip
                    icon={<PersonIcon />}
                    label={videoInfo.author}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<TimerIcon />}
                    label={formatDuration(videoInfo.lengthSeconds)}
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<VisibilityIcon />}
                    label={`${formatViews(videoInfo.viewCount)} views`}
                    color="info"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>

            <Divider sx={{ my: 3 }} />

            {/* Format Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                เลือกรูปแบบการดาวน์โหลด
              </Typography>
              <ToggleButtonGroup
                value={downloadFormat}
                exclusive
                onChange={(_, newFormat) => {
                  if (newFormat !== null) {
                    setDownloadFormat(newFormat);
                  }
                }}
                fullWidth
                sx={{ mt: 2 }}
              >
                <ToggleButton value="video" sx={{ py: 2 }}>
                  <Stack alignItems="center" spacing={1}>
                    <VideoFileIcon sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        วิดีโอ + เสียง
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        คุณภาพสูงสุด (MP4)
                      </Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="audio" sx={{ py: 2 }}>
                  <Stack alignItems="center" spacing={1}>
                    <AudioFileIcon sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        เฉพาะเสียง
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        128kbps (MP3)
                      </Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Download Buttons */}
            <Grid container spacing={2}>
              <Grid size={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={() => handleDownload('normal')}
                  disabled={loading}
                  startIcon={<DownloadIcon />}
                  sx={{ py: 2 }}
                >
                  ดาวน์โหลดคุณภาพสูง
                </Button>
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleDownload('fast')}
                  disabled={loading}
                  startIcon={<FlashOnIcon />}
                  sx={{
                    py: 2,
                    background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7b1fa2 30%, #c2185b 90%)',
                    }
                  }}
                >
                  ดาวน์โหลดแบบเร็ว
                </Button>
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleSummarize}
                  disabled={loading || summaryLoading}
                  startIcon={summaryLoading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                  sx={{
                    py: 2,
                    borderWidth: 2,
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: '#764ba2',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    }
                  }}
                >
                  {summaryLoading ? 'กำลังสร้างสรุป...' : 'สรุปเนื้อหา'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Info Cards */}
      <Grid container spacing={3}>
        <Grid size={12}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <VideoFileIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight="bold">
              คุณภาพสูง
            </Typography>
            <Typography variant="body2" color="text.secondary">
              รวมวิดีโอและเสียงด้วย FFmpeg
            </Typography>
          </Paper>
        </Grid>
        <Grid size={12}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <FlashOnIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight="bold">
              ดาวน์โหลดเร็ว
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ใช้ format ที่มีอยู่แล้ว
            </Typography>
          </Paper>
        </Grid>
        <Grid size={12}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <AudioFileIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight="bold">
              แปลงเป็น MP3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ดาวน์โหลดเฉพาะเสียง
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary Modal */}
      <SummaryModal
        open={summaryModalOpen}
        onClose={handleCloseSummary}
        summary={summaryData}
        loading={summaryLoading}
        error={summaryError}
      />
    </Container>
  );
};

export default YouTubeDownloader;