/**
 * BACKEND API - SISTEM SARAF DIGITAL KEBUN
 * 
 * Filosofi 3P:
 * - SIMPLE: Kerumitan di backend, bukan di UI lapangan
 * - TEPAT: Validasi server-side, Jejak Digital 5W1H
 * - PENINGKATAN BERTAHAP: Closed loop feedback system
 * 
 * Arsitektur: Node.js + Express + Supabase (PostgreSQL/PostGIS)
 */

// 1. Import dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 2. Import configurations
const { supabase, testConnection } = require('./config/supabase');

// 3. Import routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const spkRoutes = require('./routes/spkRoutes');
const lifecycleRoutes = require('./routes/lifecycleRoutes');
const droneNdreRoutes = require('./routes/droneNdreRoutes');
const spkValidasiDroneRoutes = require('./routes/spkValidasiDroneRoutes');
const opsSpkRoutes = require('./routes/opsSpkRoutes');
const validationRoutes = require('./routes/validationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const mandorRoutes = require('./routes/mandorRoutes');

// 4. Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// 5. Middleware
// CORS: Allow Platform B (Dashboard) to access API
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON Body Parser
app.use(express.json({ limit: '10mb' })); // Limit untuk upload foto base64

// Request Logger (Simple)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 6. Routes

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API - Sistem Saraf Digital Kebun',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check dengan database connection test
const healthCheckHandler = async (req, res) => {
  const dbConnected = await testConnection();
  
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected ? 'Server healthy' : 'Database connection failed',
    database: dbConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
};

// Register health check di 2 path (untuk compatibility)
app.get('/health', healthCheckHandler);
app.get('/api/v1/health', healthCheckHandler); // Alias untuk frontend yang expect /api/v1 prefix

// API v1 Routes
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/spk', spkRoutes);
app.use('/api/v1/spk', spkValidasiDroneRoutes); // SPK Validasi Drone routes
app.use('/api/v1/lifecycle', lifecycleRoutes);
app.use('/api/v1/drone', droneNdreRoutes);
app.use('/api/v1/ops', opsSpkRoutes); // OPS Multi-Purpose SPK routes
app.use('/api/v1/validation', validationRoutes); // Validation & Confusion Matrix routes
app.use('/api/v1/analytics', analyticsRoutes); // Analytics & Performance routes
app.use('/api/v1/mandor', mandorRoutes); // Mandor Dashboard routes

// ðŸ” DEBUG: Print all registered routes
console.log('\nðŸ” [DEBUG] Registered /api/v1/spk routes:');
console.log('  - spkRoutes registered');
console.log('  - spkValidasiDroneRoutes registered');
console.log('  - Check spkValidasiDroneRoutes.js for /kanban route (should be BEFORE /:spk_id)');
console.log('');

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Endpoint ${req.method} ${req.url} tidak ditemukan`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('âŒ [Global Error]:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    message: 'Terjadi kesalahan pada server'
  });
});

// 7. Start server
app.listen(PORT, async () => {
  console.log('='.repeat(60));
  console.log('ðŸš€ BACKEND API - SISTEM SARAF DIGITAL KEBUN');
  console.log('='.repeat(60));
  console.log(`ðŸ“¡ Server running on: http://localhost:${PORT}`);
  console.log(`ðŸŒ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`ðŸ“Š Supabase URL: ${process.env.SUPABASE_URL || 'Not configured'}`);
  
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.log('âš ï¸  WARNING: Database connection failed! Check .env file.');
  }
  
  console.log('='.repeat(60));
  console.log('ðŸ“š Available Endpoints:');
  console.log('   GET  /                                 - API Info');
  console.log('   GET  /health                           - Health Check');
  console.log('');
  console.log('   ðŸ” AUTHENTICATION: Use Supabase Auth (Frontend SDK)');
  console.log('   ðŸ“– Docs: https://supabase.com/docs/guides/auth');
  console.log('');
  console.log('   ðŸ“Š DASHBOARD (READ) - ðŸ” JWT Required:');
  console.log('   GET  /api/v1/dashboard/kpi-eksekutif   - KPI Eksekutif (M-1.1) ðŸ”');
  console.log('   GET  /api/v1/dashboard/operasional     - Dashboard Operasional (M-1.2) ðŸ”');
  console.log('   GET  /api/v1/dashboard/teknis          - Dashboard Teknis (M-1.3) ðŸ”');
  console.log('');
  console.log('   ðŸŒ± LIFECYCLE (READ) - Multi-Phase Metrics:');
  console.log('   GET  /api/v1/lifecycle/overview        - All 5 Phases Summary');
  console.log('   GET  /api/v1/lifecycle/phase/:name     - Specific Phase Metrics');
  console.log('   GET  /api/v1/lifecycle/sop-compliance  - SOP Compliance by Phase');
  console.log('');
  console.log('   âœï¸  SPK - ORGANIZING (Platform B) - ðŸ” JWT Required:');
  console.log('   POST /api/v1/spk/                      - Buat SPK Header âœ… M-4.1 ðŸ”');
  console.log('   POST /api/v1/spk/:id_spk/tugas         - Tambah Tugas ke SPK âœ… M-4.2 ðŸ”');
  console.log('');
  console.log('   ðŸ“± SPK - ACTUATING (Platform A) - ðŸ” JWT Required:');
  console.log('   GET  /api/v1/spk/tugas/saya            - Ambil Tugas Saya ðŸ”');
  console.log('   POST /api/v1/spk/log_aktivitas         - Upload Log 5W1H + Auto-Trigger ðŸ”');
  console.log('');
  console.log('   ðŸ” RBAC FASE 1, 2, 3: All endpoints protected (100% coverage)');
  console.log('   ðŸ” AUTH: Supabase Auth with JWT verification + Legacy JWT fallback');
  console.log('   ðŸ”§ Auto-Trigger: Work Order APH/Sanitasi (status G1/G4)');
  console.log('='.repeat(60));
});
