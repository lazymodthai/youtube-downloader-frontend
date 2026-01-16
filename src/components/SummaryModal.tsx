import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  Description as DescriptionIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import type { SummaryResponse } from '../types';
import { exportSummaryToDocx } from '../utils/exportDocx';

interface SummaryModalProps {
  open: boolean;
  onClose: () => void;
  summary: SummaryResponse | null;
  loading: boolean;
  error: string | null;
}

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SummaryModal: React.FC<SummaryModalProps> = ({
  open,
  onClose,
  summary,
  loading,
  error,
}) => {
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    if (!summary) return;
    setExporting(true);
    try {
      await exportSummaryToDocx(summary);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoAwesomeIcon />
          <Typography variant="h6" fontWeight="bold">
            สรุปเนื้อหาวิดีโอ
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
            }}
          >
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              กำลังสร้างสรุปเนื้อหา...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              อาจใช้เวลาสักครู่
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="error" variant="h6">
              เกิดข้อผิดพลาด
            </Typography>
            <Typography color="text.secondary">{error}</Typography>
          </Box>
        )}

        {!loading && !error && summary && (
          <Box>
            {/* Title */}
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {summary.title}
            </Typography>

            {/* Meta Info */}
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
              <Chip
                icon={<PersonIcon />}
                label={summary.author}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<TimerIcon />}
                label={formatDuration(summary.duration)}
                color="secondary"
                variant="outlined"
              />
              <Chip
                icon={<DescriptionIcon />}
                label={`${summary.transcriptLength.toLocaleString()} ตัวอักษร`}
                color="info"
                variant="outlined"
              />
              <Chip
                label={summary.transcriptSource === 'subtitle' ? 'จาก Subtitle' : 'จาก Audio'}
                color="default"
                variant="outlined"
                size="small"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Market Highlights */}
            {summary.marketHighlights && summary.marketHighlights.length > 0 && (
              <>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  📊 Market Highlights
                </Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {summary.marketHighlights.map((highlight, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {highlight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {highlight.description}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}

            {/* Papers / Research */}
            {summary.papers && summary.papers.length > 0 && (
              <>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="secondary"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  📑 งานวิจัย / รายงาน
                </Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {summary.papers.map((paper, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Chip label={paper.source} size="small" color="secondary" />
                        <Typography variant="subtitle2" fontWeight="bold">
                          {paper.title}
                        </Typography>
                      </Stack>
                      <List dense disablePadding>
                        {paper.keyFindings.map((finding, fIndex) => (
                          <ListItem key={fIndex} sx={{ py: 0.5, px: 0, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                              <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={finding.title}
                              secondary={finding.description}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                              secondaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}

            {/* Conclusion */}
            {summary.conclusion && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'success.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'success.200',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="success.dark"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  ✅ สรุป
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                    color: 'text.primary',
                  }}
                >
                  {summary.conclusion}
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} color="inherit">
          ปิด
        </Button>
        <Button
          variant="contained"
          startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
          onClick={handleExport}
          disabled={!summary || loading || exporting}
          sx={{
            background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #388e3c 30%, #689f38 90%)',
            },
          }}
        >
          {exporting ? 'กำลังสร้างไฟล์...' : 'ส่งออกเป็น DOCX'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SummaryModal;
