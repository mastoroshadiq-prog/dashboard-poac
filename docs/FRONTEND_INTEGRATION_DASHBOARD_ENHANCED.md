# 🎨 Frontend Integration Guide - Dashboard Enhancement

**Target Audience:** Frontend Developers (React/Vue/Next.js)  
**Backend API Version:** 2.0 (Enhanced)  
**Last Updated:** November 10, 2025  
**Difficulty:** ⭐⭐ Intermediate

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [API Endpoints Overview](#api-endpoints-overview)
3. [React Integration Examples](#react-integration-examples)
4. [Chart Visualizations](#chart-visualizations)
5. [UI Components](#ui-components)
6. [Error Handling](#error-handling)
7. [TypeScript Types](#typescript-types)
8. [Testing](#testing)

---

## 🚀 Quick Start

### **Prerequisites**
```bash
# Required packages
npm install axios date-fns
# For charts
npm install recharts
# OR
npm install chart.js react-chartjs-2
```

### **Environment Setup**
```javascript
// .env.local
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
```

### **API Service Setup**
```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🔌 API Endpoints Overview

### **1. KPI Eksekutif (Enhanced)**

```javascript
// src/services/dashboardService.js
import api from './api';

export const fetchKPIEksekutif = async () => {
  try {
    const response = await api.get('/dashboard/kpi-eksekutif');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch KPI Eksekutif:', error);
    throw error;
  }
};
```

**Response Structure:**
```typescript
{
  success: boolean;
  data: {
    // Existing fields
    kri_lead_time_aph: number;
    kri_kepatuhan_sop: number;
    tren_insidensi_baru: Array<{date: string, count: number}>;
    tren_g4_aktif: number;
    
    // ⭐ NEW Enhancement fields
    tren_kepatuhan_sop: Array<{periode: string, nilai: number}>;
    planning_accuracy: {
      last_month: {
        target_completion: number;
        actual_completion: number;
        accuracy_percentage: number;
      };
      current_month: {
        target_completion: number;
        actual_completion: number;
        accuracy_percentage: number;
        projected_final_accuracy: number;
      };
    };
    
    generated_at: string;
    filters: object;
  };
  message: string;
}
```

### **2. Dashboard Operasional (Enhanced)**

```javascript
export const fetchDashboardOperasional = async () => {
  try {
    const response = await api.get('/dashboard/operasional');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Dashboard Operasional:', error);
    throw error;
  }
};
```

**Response Structure:**
```typescript
{
  success: boolean;
  data: {
    data_corong: {
      // Existing fields
      target_validasi: number;
      validasi_selesai: number;
      target_aph: number;
      aph_selesai: number;
      target_sanitasi: number;
      sanitasi_selesai: number;
      
      // ⭐ NEW Enhancement fields
      deadline_validasi: string | null;  // ISO 8601 date
      deadline_aph: string | null;
      deadline_sanitasi: string | null;
      
      risk_level_validasi: 'LOW' | 'MEDIUM' | 'CRITICAL';
      risk_level_aph: 'LOW' | 'MEDIUM' | 'CRITICAL';
      risk_level_sanitasi: 'LOW' | 'MEDIUM' | 'CRITICAL';
      
      blockers_validasi: string[];
      blockers_aph: string[];
      blockers_sanitasi: string[];
      
      pelaksana_assigned_validasi: number;
      pelaksana_assigned_aph: number;
      pelaksana_assigned_sanitasi: number;
    };
    data_papan_peringkat: Array<{
      id_pelaksana: string;
      selesai: number;
      total: number;
      rate: number;
    }>;
    generated_at: string;
    filters: object;
  };
  message: string;
}
```

---

## ⚛️ React Integration Examples

### **Example 1: KPI Eksekutif Dashboard Component**

```jsx
// src/components/Dashboard/KPIEksekutif.jsx
import React, { useState, useEffect } from 'react';
import { fetchKPIEksekutif } from '../../services/dashboardService';
import TrenKepatuhanSOPChart from './charts/TrenKepatuhanSOPChart';
import PlanningAccuracyCard from './cards/PlanningAccuracyCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

const KPIEksekutif = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchKPIEksekutif();
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load KPI data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return null;
  
  return (
    <div className="kpi-eksekutif-dashboard">
      <h1>Dashboard KPI Eksekutif</h1>
      
      {/* Existing KPI Cards */}
      <div className="kpi-cards">
        <KPICard 
          title="Lead Time APH" 
          value={data.kri_lead_time_aph} 
          unit="hari"
          trend={data.kri_lead_time_aph < 3 ? 'good' : 'warning'}
        />
        <KPICard 
          title="Kepatuhan SOP" 
          value={data.kri_kepatuhan_sop} 
          unit="%"
          target={90}
        />
        <KPICard 
          title="G4 Aktif" 
          value={data.tren_g4_aktif} 
          unit="pohon"
        />
      </div>
      
      {/* ⭐ NEW: Tren Kepatuhan SOP Chart */}
      <div className="tren-kepatuhan-section">
        <h2>Tren Kepatuhan SOP (8 Minggu)</h2>
        <TrenKepatuhanSOPChart data={data.tren_kepatuhan_sop} />
      </div>
      
      {/* ⭐ NEW: Planning Accuracy */}
      <div className="planning-accuracy-section">
        <h2>Planning Accuracy</h2>
        <PlanningAccuracyCard accuracy={data.planning_accuracy} />
      </div>
    </div>
  );
};

export default KPIEksekutif;
```

### **Example 2: Dashboard Operasional Component**

```jsx
// src/components/Dashboard/DashboardOperasional.jsx
import React, { useState, useEffect } from 'react';
import { fetchDashboardOperasional } from '../../services/dashboardService';
import FunnelChart from './charts/FunnelChart';
import CategoryCard from './cards/CategoryCard';
import LeaderboardTable from './tables/LeaderboardTable';

const DashboardOperasional = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDashboardOperasional();
        setData(response.data);
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (!data) return null;
  
  const { data_corong, data_papan_peringkat } = data;
  
  return (
    <div className="dashboard-operasional">
      <h1>Dashboard Operasional</h1>
      
      {/* Funnel Chart */}
      <FunnelChart data={data_corong} />
      
      {/* ⭐ NEW: Enhanced Category Cards with Risk & Blockers */}
      <div className="category-cards">
        <CategoryCard
          title="Validasi Drone"
          target={data_corong.target_validasi}
          selesai={data_corong.validasi_selesai}
          deadline={data_corong.deadline_validasi}
          riskLevel={data_corong.risk_level_validasi}
          blockers={data_corong.blockers_validasi}
          pelaksanaAssigned={data_corong.pelaksana_assigned_validasi}
        />
        
        <CategoryCard
          title="APH"
          target={data_corong.target_aph}
          selesai={data_corong.aph_selesai}
          deadline={data_corong.deadline_aph}
          riskLevel={data_corong.risk_level_aph}
          blockers={data_corong.blockers_aph}
          pelaksanaAssigned={data_corong.pelaksana_assigned_aph}
        />
        
        <CategoryCard
          title="Sanitasi"
          target={data_corong.target_sanitasi}
          selesai={data_corong.sanitasi_selesai}
          deadline={data_corong.deadline_sanitasi}
          riskLevel={data_corong.risk_level_sanitasi}
          blockers={data_corong.blockers_sanitasi}
          pelaksanaAssigned={data_corong.pelaksana_assigned_sanitasi}
        />
      </div>
      
      {/* Leaderboard */}
      <LeaderboardTable data={data_papan_peringkat} />
    </div>
  );
};

export default DashboardOperasional;
```

---

## 📊 Chart Visualizations

### **Chart 1: Tren Kepatuhan SOP (Line Chart)**

Using **Recharts**:

```jsx
// src/components/charts/TrenKepatuhanSOPChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrenKepatuhanSOPChart = ({ data }) => {
  // Transform data for Recharts
  // Input: [{ periode: "Week 1", nilai: 15.0 }, ...]
  // Output: Same format, Recharts-ready
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="periode" 
          label={{ value: 'Periode', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          label={{ value: 'Kepatuhan SOP (%)', angle: -90, position: 'insideLeft' }}
          domain={[0, 100]}
        />
        <Tooltip 
          formatter={(value) => [`${value.toFixed(1)}%`, 'Kepatuhan SOP']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="nilai" 
          name="Kepatuhan SOP"
          stroke="#8884d8" 
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        {/* Target line at 90% */}
        <Line 
          type="monotone" 
          dataKey={() => 90} 
          name="Target (90%)"
          stroke="#82ca9d" 
          strokeDasharray="5 5"
          strokeWidth={1}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrenKepatuhanSOPChart;
```

Using **Chart.js**:

```jsx
// Alternative with Chart.js
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TrenKepatuhanSOPChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.periode),
    datasets: [
      {
        label: 'Kepatuhan SOP (%)',
        data: data.map(item => item.nilai),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Target (90%)',
        data: Array(data.length).fill(90),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Kepatuhan SOP (%)'
        }
      }
    }
  };
  
  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TrenKepatuhanSOPChart;
```

---

## 🎨 UI Components

### **Component 1: Category Card with Risk Indicator**

```jsx
// src/components/cards/CategoryCard.jsx
import React from 'react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import './CategoryCard.css';

const CategoryCard = ({ 
  title, 
  target, 
  selesai, 
  deadline, 
  riskLevel, 
  blockers, 
  pelaksanaAssigned 
}) => {
  // Calculate progress percentage
  const progress = target > 0 ? (selesai / target) * 100 : 0;
  
  // Risk level styling
  const getRiskStyle = (level) => {
    switch (level) {
      case 'CRITICAL':
        return { color: '#dc3545', icon: '🔴', label: 'Critical' };
      case 'MEDIUM':
        return { color: '#ffc107', icon: '🟡', label: 'Medium' };
      case 'LOW':
        return { color: '#28a745', icon: '🟢', label: 'Low' };
      default:
        return { color: '#6c757d', icon: '⚪', label: 'Unknown' };
    }
  };
  
  const riskStyle = getRiskStyle(riskLevel);
  
  // Format deadline
  const formatDeadline = (deadlineStr) => {
    if (!deadlineStr) return 'No deadline set';
    
    try {
      const deadlineDate = parseISO(deadlineStr);
      const now = new Date();
      const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
      
      const formattedDate = format(deadlineDate, 'dd MMM yyyy', { locale: localeId });
      
      if (diffDays < 0) {
        return `${formattedDate} (Overdue ${Math.abs(diffDays)} days)`;
      } else if (diffDays === 0) {
        return `${formattedDate} (Today!)`;
      } else if (diffDays <= 7) {
        return `${formattedDate} (${diffDays} days left) ⚠️`;
      } else {
        return `${formattedDate} (${diffDays} days left)`;
      }
    } catch (err) {
      return deadlineStr;
    }
  };
  
  return (
    <div className="category-card">
      {/* Header */}
      <div className="card-header">
        <h3>{title}</h3>
        <span className="risk-badge" style={{ color: riskStyle.color }}>
          {riskStyle.icon} {riskStyle.label}
        </span>
      </div>
      
      {/* Progress */}
      <div className="card-progress">
        <div className="progress-stats">
          <span className="stat-complete">{selesai} Selesai</span>
          <span className="stat-total">/ {target} Total</span>
          <span className="stat-percentage">{progress.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: progress >= 70 ? '#28a745' : progress >= 30 ? '#ffc107' : '#dc3545'
            }}
          />
        </div>
      </div>
      
      {/* ⭐ NEW: Deadline */}
      <div className="card-deadline">
        <strong>Deadline:</strong> {formatDeadline(deadline)}
      </div>
      
      {/* ⭐ NEW: Resource Allocation */}
      <div className="card-resources">
        <strong>Workers Assigned:</strong> {pelaksanaAssigned} pelaksana
      </div>
      
      {/* ⭐ NEW: Blockers */}
      {blockers && blockers.length > 0 && (
        <div className="card-blockers">
          <strong>⚠️ Blockers:</strong>
          <ul>
            {blockers.map((blocker, index) => (
              <li key={index} className="blocker-item">{blocker}</li>
            ))}
          </ul>
        </div>
      )}
      
      {blockers && blockers.length === 0 && (
        <div className="card-no-blockers">
          ✅ No blockers - On track!
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
```

**CSS Styling:**

```css
/* src/components/cards/CategoryCard.css */
.category-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.risk-badge {
  font-weight: bold;
  font-size: 0.9rem;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(0,0,0,0.05);
}

.card-progress {
  margin-bottom: 15px;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.stat-complete {
  color: #28a745;
  font-weight: bold;
}

.stat-total {
  color: #6c757d;
}

.stat-percentage {
  font-weight: bold;
  color: #007bff;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.card-deadline,
.card-resources {
  margin: 10px 0;
  font-size: 0.9rem;
  color: #495057;
}

.card-blockers {
  margin-top: 15px;
  padding: 12px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
}

.card-blockers strong {
  display: block;
  margin-bottom: 8px;
  color: #856404;
}

.card-blockers ul {
  margin: 0;
  padding-left: 20px;
}

.blocker-item {
  margin: 4px 0;
  color: #856404;
}

.card-no-blockers {
  margin-top: 15px;
  padding: 12px;
  background: #d4edda;
  border-left: 4px solid #28a745;
  border-radius: 4px;
  color: #155724;
}
```

### **Component 2: Planning Accuracy Card**

```jsx
// src/components/cards/PlanningAccuracyCard.jsx
import React from 'react';
import './PlanningAccuracyCard.css';

const PlanningAccuracyCard = ({ accuracy }) => {
  if (!accuracy) return null;
  
  const { last_month, current_month } = accuracy;
  
  // Calculate trend (improving or declining)
  const trend = current_month.accuracy_percentage > last_month.accuracy_percentage 
    ? 'improving' 
    : 'declining';
  
  const trendIcon = trend === 'improving' ? '📈' : '📉';
  const trendColor = trend === 'improving' ? '#28a745' : '#dc3545';
  
  return (
    <div className="planning-accuracy-card">
      <div className="accuracy-section">
        <h4>Last Month</h4>
        <div className="accuracy-stats">
          <div className="stat">
            <span className="stat-label">Target:</span>
            <span className="stat-value">{last_month.target_completion} tasks</span>
          </div>
          <div className="stat">
            <span className="stat-label">Completed:</span>
            <span className="stat-value">{last_month.actual_completion} tasks</span>
          </div>
          <div className="stat accuracy-percentage">
            <span className="stat-label">Accuracy:</span>
            <span className="stat-value">{last_month.accuracy_percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      <div className="accuracy-divider"></div>
      
      <div className="accuracy-section">
        <h4>Current Month</h4>
        <div className="accuracy-stats">
          <div className="stat">
            <span className="stat-label">Target:</span>
            <span className="stat-value">{current_month.target_completion} tasks</span>
          </div>
          <div className="stat">
            <span className="stat-label">Completed:</span>
            <span className="stat-value">{current_month.actual_completion} tasks</span>
          </div>
          <div className="stat accuracy-percentage">
            <span className="stat-label">Accuracy:</span>
            <span className="stat-value">{current_month.accuracy_percentage.toFixed(1)}%</span>
          </div>
          <div className="stat projected">
            <span className="stat-label">Projected Final:</span>
            <span className="stat-value">{current_month.projected_final_accuracy.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      <div className="accuracy-trend">
        <span style={{ color: trendColor }}>
          {trendIcon} Trend: {trend === 'improving' ? 'Improving' : 'Declining'}
        </span>
      </div>
    </div>
  );
};

export default PlanningAccuracyCard;
```

---

## 🛡️ Error Handling

### **Complete Error Handling Pattern**

```jsx
// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback } from 'react';
import { fetchKPIEksekutif } from '../services/dashboardService';

const useDashboardData = (fetchFunction, refreshInterval = 300000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchFunction();
      
      if (!response.success) {
        throw new Error(response.message || 'API returned error');
      }
      
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      
      // Handle different error types
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        
        if (status === 401) {
          setError('Session expired. Please login again.');
          // Redirect to login
          window.location.href = '/login';
        } else if (status === 403) {
          setError('You do not have permission to view this dashboard.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.response.data?.message || 'Failed to load dashboard data');
        }
      } else if (err.request) {
        // Request made but no response
        setError('Network error. Please check your connection.');
      } else {
        // Other errors
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);
  
  useEffect(() => {
    loadData();
    
    // Auto-refresh
    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadData, refreshInterval]);
  
  return { data, loading, error, lastUpdated, reload: loadData };
};

export default useDashboardData;
```

**Usage:**

```jsx
// In component
import useDashboardData from '../../hooks/useDashboardData';
import { fetchKPIEksekutif } from '../../services/dashboardService';

const KPIEksekutif = () => {
  const { data, loading, error, lastUpdated, reload } = useDashboardData(
    fetchKPIEksekutif,
    300000 // 5 minutes
  );
  
  if (loading && !data) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }
  
  if (error) {
    return (
      <ErrorAlert 
        message={error} 
        onRetry={reload}
      />
    );
  }
  
  return (
    <div>
      {/* Dashboard content */}
      {lastUpdated && (
        <div className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
```

---

## 📝 TypeScript Types

```typescript
// src/types/dashboard.ts

export interface TrenKepatuhanSOPData {
  periode: string;  // "Week 1", "Week 2", etc.
  nilai: number;    // 0-100
}

export interface PlanningAccuracy {
  last_month: {
    target_completion: number;
    actual_completion: number;
    accuracy_percentage: number;
  };
  current_month: {
    target_completion: number;
    actual_completion: number;
    accuracy_percentage: number;
    projected_final_accuracy: number;
  };
}

export interface KPIEksekutifData {
  kri_lead_time_aph: number;
  kri_kepatuhan_sop: number;
  tren_insidensi_baru: Array<{
    date: string;
    count: number;
  }>;
  tren_g4_aktif: number;
  tren_kepatuhan_sop: TrenKepatuhanSOPData[];
  planning_accuracy: PlanningAccuracy;
  generated_at: string;
  filters: Record<string, any>;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'CRITICAL';

export interface DataCorong {
  target_validasi: number;
  validasi_selesai: number;
  target_aph: number;
  aph_selesai: number;
  target_sanitasi: number;
  sanitasi_selesai: number;
  
  // Enhanced fields
  deadline_validasi: string | null;
  deadline_aph: string | null;
  deadline_sanitasi: string | null;
  
  risk_level_validasi: RiskLevel;
  risk_level_aph: RiskLevel;
  risk_level_sanitasi: RiskLevel;
  
  blockers_validasi: string[];
  blockers_aph: string[];
  blockers_sanitasi: string[];
  
  pelaksana_assigned_validasi: number;
  pelaksana_assigned_aph: number;
  pelaksana_assigned_sanitasi: number;
}

export interface DashboardOperasionalData {
  data_corong: DataCorong;
  data_papan_peringkat: Array<{
    id_pelaksana: string;
    selesai: number;
    total: number;
    rate: number;
  }>;
  generated_at: string;
  filters: Record<string, any>;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
```

---

## 🧪 Testing

### **Unit Test Example (Jest + React Testing Library)**

```javascript
// src/components/cards/__tests__/CategoryCard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryCard from '../CategoryCard';

describe('CategoryCard', () => {
  const mockProps = {
    title: 'Validasi Drone',
    target: 10,
    selesai: 7,
    deadline: '2025-11-15',
    riskLevel: 'LOW',
    blockers: [],
    pelaksanaAssigned: 2
  };
  
  it('renders correctly with LOW risk', () => {
    render(<CategoryCard {...mockProps} />);
    
    expect(screen.getByText('Validasi Drone')).toBeInTheDocument();
    expect(screen.getByText('🟢 Low')).toBeInTheDocument();
    expect(screen.getByText('7 Selesai')).toBeInTheDocument();
    expect(screen.getByText('/ 10 Total')).toBeInTheDocument();
  });
  
  it('displays blockers when present', () => {
    const propsWithBlockers = {
      ...mockProps,
      riskLevel: 'CRITICAL',
      blockers: ['Deadline passed by 2 days', 'No pelaksana assigned yet']
    };
    
    render(<CategoryCard {...propsWithBlockers} />);
    
    expect(screen.getByText('⚠️ Blockers:')).toBeInTheDocument();
    expect(screen.getByText('Deadline passed by 2 days')).toBeInTheDocument();
    expect(screen.getByText('No pelaksana assigned yet')).toBeInTheDocument();
  });
  
  it('shows "No blockers" message when blockers array is empty', () => {
    render(<CategoryCard {...mockProps} />);
    
    expect(screen.getByText('✅ No blockers - On track!')).toBeInTheDocument();
  });
  
  it('calculates progress percentage correctly', () => {
    render(<CategoryCard {...mockProps} />);
    
    expect(screen.getByText('70.0%')).toBeInTheDocument();
  });
});
```

---

## 📚 Utility Functions

```javascript
// src/utils/dashboardHelpers.js

/**
 * Format risk level to UI-friendly format
 */
export const getRiskConfig = (riskLevel) => {
  const configs = {
    CRITICAL: {
      color: '#dc3545',
      bgColor: '#f8d7da',
      icon: '🔴',
      label: 'Critical',
      className: 'risk-critical'
    },
    MEDIUM: {
      color: '#ffc107',
      bgColor: '#fff3cd',
      icon: '🟡',
      label: 'Medium',
      className: 'risk-medium'
    },
    LOW: {
      color: '#28a745',
      bgColor: '#d4edda',
      icon: '🟢',
      label: 'Low',
      className: 'risk-low'
    }
  };
  
  return configs[riskLevel] || configs.LOW;
};

/**
 * Calculate days until deadline
 */
export const getDaysUntilDeadline = (deadlineStr) => {
  if (!deadlineStr) return null;
  
  try {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (err) {
    return null;
  }
};

/**
 * Format deadline with urgency indicator
 */
export const formatDeadlineWithUrgency = (deadlineStr) => {
  if (!deadlineStr) return { text: 'No deadline', urgency: 'none' };
  
  const daysLeft = getDaysUntilDeadline(deadlineStr);
  
  if (daysLeft === null) {
    return { text: deadlineStr, urgency: 'none' };
  }
  
  const date = new Date(deadlineStr).toLocaleDateString('id-ID');
  
  if (daysLeft < 0) {
    return {
      text: `${date} (Overdue ${Math.abs(daysLeft)} days)`,
      urgency: 'critical'
    };
  } else if (daysLeft === 0) {
    return {
      text: `${date} (Today!)`,
      urgency: 'critical'
    };
  } else if (daysLeft <= 3) {
    return {
      text: `${date} (${daysLeft} days left)`,
      urgency: 'high'
    };
  } else if (daysLeft <= 7) {
    return {
      text: `${date} (${daysLeft} days left)`,
      urgency: 'medium'
    };
  } else {
    return {
      text: `${date} (${daysLeft} days left)`,
      urgency: 'low'
    };
  }
};

/**
 * Calculate completion percentage
 */
export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return (completed / total) * 100;
};

/**
 * Get progress color based on percentage
 */
export const getProgressColor = (percentage) => {
  if (percentage >= 70) return '#28a745'; // Green
  if (percentage >= 30) return '#ffc107'; // Yellow
  return '#dc3545'; // Red
};

/**
 * Transform tren_kepatuhan_sop data for charts
 */
export const transformTrenDataForChart = (trenData) => {
  if (!trenData || trenData.length === 0) return [];
  
  return trenData.map(item => ({
    ...item,
    nilai: parseFloat(item.nilai.toFixed(1)),
    // Add target line data
    target: 90
  }));
};
```

---

## 🎯 Quick Implementation Checklist

### **Phase 1: Basic Integration (1-2 hours)**
- [ ] Install dependencies (`axios`, `recharts`, `date-fns`)
- [ ] Setup API service (`src/services/api.js`)
- [ ] Create dashboard service functions
- [ ] Test API connectivity with console.log

### **Phase 2: UI Components (2-3 hours)**
- [ ] Create `CategoryCard` component
- [ ] Create `PlanningAccuracyCard` component
- [ ] Add CSS styling
- [ ] Test with mock data

### **Phase 3: Chart Integration (1-2 hours)**
- [ ] Install chart library (Recharts or Chart.js)
- [ ] Create `TrenKepatuhanSOPChart` component
- [ ] Test chart with API data
- [ ] Add responsive design

### **Phase 4: Error Handling & Polish (1 hour)**
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Add retry logic
- [ ] Add last-updated timestamp

### **Phase 5: Testing (1 hour)**
- [ ] Write unit tests for components
- [ ] Test with different risk levels
- [ ] Test with empty blockers array
- [ ] Test with null deadlines

**Total Estimated Time:** 6-9 hours

---

## 🔗 Additional Resources

- **API Documentation:** `docs/API_DASHBOARD_ENHANCED.md`
- **Backend Spec:** `context/API_SPEC_Enhancement_PLAN_Quadrant.md`
- **Recharts Docs:** https://recharts.org/
- **Chart.js Docs:** https://www.chartjs.org/
- **date-fns Docs:** https://date-fns.org/

---

## 💡 Pro Tips

1. **Use TypeScript** untuk type safety
2. **Memoize expensive calculations** dengan `useMemo`
3. **Implement skeleton loading** untuk better UX
4. **Add tooltips** di chart untuk detail info
5. **Use React.lazy** untuk code splitting
6. **Cache API responses** dengan React Query atau SWR
7. **Add print-friendly CSS** untuk executive reports

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025  
**Frontend Ready:** ✅ **YES** - Copy-paste ready!
