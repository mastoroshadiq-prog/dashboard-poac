const { supabase } = require('../config/supabase');

async function logSOPCompliance(params) {
  const { id_log_aktivitas, id_tugas, id_sop, checklist_completed = [], completion_time_mins, surveyor_notes } = params;
  
  const metrics = calculateComplianceMetrics(checklist_completed);
  const photos_uploaded = checklist_completed.filter(item => item.photo_url).length;
  
  const { data, error } = await supabase.from('sop_compliance_log').insert({
    id_log_aktivitas, id_tugas, id_sop,
    checklist_completed: JSON.stringify(checklist_completed),
    compliance_rate: metrics.compliance_rate,
    total_items: metrics.total_items,
    completed_items: metrics.completed_items,
    mandatory_items: metrics.mandatory_items,
    mandatory_completed: metrics.mandatory_completed,
    photos_uploaded,
    completion_time_mins,
    surveyor_notes
  }).select().single();
  
  if (error) throw error;
  return { success: true, data, metrics };
}

function calculateComplianceMetrics(checklist) {
  const total = checklist.length;
  const completed = checklist.filter(i => i.done).length;
  const mandatory = checklist.filter(i => i.is_mandatory).length;
  const mandatoryDone = checklist.filter(i => i.is_mandatory && i.done).length;
  
  let rate = total > 0 ? (completed / total) * 100 : 0;
  if (mandatory > 0 && mandatoryDone < mandatory) rate = rate * 0.7;
  
  return { total_items: total, completed_items: completed, mandatory_items: mandatory, mandatory_completed: mandatoryDone, compliance_rate: Math.round(rate * 100) / 100 };
}

module.exports = { logSOPCompliance, calculateComplianceMetrics };
