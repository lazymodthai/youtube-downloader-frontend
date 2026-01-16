import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import type { UsageLog, UsageLogResponse, SummaryResponse } from '../types';
import SummaryModal from './SummaryModal';

const History: React.FC = () => {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Summary modal states for viewing summary from history
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const backendUrl = 'http://localhost:4000';

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/usage-logs?limit=${rowsPerPage}&offset=${page * rowsPerPage}`);
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลประวัติได้');
      const data: UsageLogResponse = await response.json();
      setLogs(data.data);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewSummary = async (videoUrl: string) => {
    setSummaryModalOpen(true);
    setSummaryLoading(true);
    setSummaryError(null);
    setSelectedSummary(null);

    try {
      // Find summary by video URL in summaries endpoint
      const response = await fetch(`${backendUrl}/summaries?limit=1&search=${encodeURIComponent(videoUrl)}`);
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลสรุปได้');
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const item = data.data[0];
        // Map snake_case from API to camelCase for SummaryModal
        const mappedSummary: SummaryResponse = {
          title: item.video_title,
          author: item.video_author,
          duration: item.video_duration,
          marketHighlights: item.market_highlights,
          papers: item.papers,
          conclusion: item.conclusion,
          transcriptLength: item.transcript_length,
          transcriptSource: item.transcript_source,
        };
        setSelectedSummary(mappedSummary);
      } else {
        throw new Error('ไม่พบข้อมูลสรุปสำหรับวิดีโอนี้');
      }
    } catch (err: any) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <Chip icon={<CheckCircleOutlineIcon />} label="สำเร็จ" color="success" size="small" variant="outlined" />;
      case 'error':
        return <Chip icon={<ErrorOutlineIcon />} label="ผิดพลาด" color="error" size="small" variant="outlined" />;
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          ประวัติการใช้งาน
        </Typography>
        <IconButton onClick={fetchHistory} disabled={loading} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>วันที่</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>วิดีโอ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>การทำงาน</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>สรุป</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">ไม่พบประวัติการใช้งาน</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString('th-TH', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500
                      }}>
                        {log.video_title}
                      </Typography>
                      <Tooltip title="ดูบน YouTube">
                        <IconButton
                          size="small"
                          component="a"
                          href={log.video_url}
                          target="_blank"
                        >
                          <OpenInNewIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.endpoint.replace('/', '').toUpperCase()}
                      size="small"
                      variant="outlined"
                      color={log.endpoint === '/summarize' ? 'secondary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {getStatusChip(log.status)}
                    {log.error_message && (
                      <Tooltip title={log.error_message}>
                        <IconButton size="small" color="error">
                          <ErrorOutlineIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {log.status === 'success' && (
                      <IconButton
                        color="secondary"
                        size="small"
                        onClick={() => handleViewSummary(log.video_url)}
                        title="ดูสรุปเนื้อหา"
                      >
                        <AutoAwesomeIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="จำนวนต่อหน้า"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
        />
      </TableContainer>

      <SummaryModal
        open={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={selectedSummary}
        loading={summaryLoading}
        error={summaryError}
      />
    </Container>
  );
};

export default History;
