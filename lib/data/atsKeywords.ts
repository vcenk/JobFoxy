// lib/data/atsKeywords.ts
// ATS Keywords Database - Industry and role-specific keywords that ATS systems look for
// These keywords significantly improve resume parsing and ranking

export interface ATSKeywordSet {
  mustHave: string[]        // Critical keywords that should appear
  technical: string[]       // Technical skills and tools
  soft: string[]           // Soft skills and competencies
  certifications?: string[] // Industry certifications
  methodologies?: string[]  // Frameworks and methodologies
}

/**
 * Industry-specific ATS keywords
 * Based on job market analysis and ATS optimization best practices
 */
export const ATS_KEYWORDS_BY_INDUSTRY: Record<string, ATSKeywordSet> = {
  technology: {
    mustHave: [
      'Agile', 'Scrum', 'CI/CD', 'Cloud Computing', 'AWS', 'Azure',
      'Docker', 'Kubernetes', 'Microservices', 'RESTful APIs',
      'SQL', 'NoSQL', 'Git', 'DevOps', 'Software Development',
    ],
    technical: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask',
      'Spring Boot', 'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch',
      'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
      'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions', 'CircleCI',
    ],
    soft: [
      'Problem-solving', 'Teamwork', 'Communication', 'Critical thinking',
      'Adaptability', 'Time management', 'Leadership', 'Collaboration',
      'Innovation', 'Analytical thinking', 'Attention to detail',
    ],
    certifications: [
      'AWS Certified', 'Azure Certified', 'Google Cloud Certified',
      'Kubernetes Certified', 'Scrum Master', 'PMP',
    ],
    methodologies: [
      'Agile', 'Scrum', 'Kanban', 'Lean', 'DevOps', 'Test-Driven Development',
      'Continuous Integration', 'Continuous Deployment',
    ],
  },

  finance: {
    mustHave: [
      'Financial Analysis', 'Excel', 'Financial Modeling', 'Forecasting',
      'Budgeting', 'GAAP', 'SOX Compliance', 'Variance Analysis',
      'P&L', 'Balance Sheet', 'Cash Flow', 'Financial Reporting',
    ],
    technical: [
      'SAP', 'Oracle Financials', 'QuickBooks', 'Bloomberg Terminal',
      'SQL', 'Tableau', 'Power BI', 'VBA', 'Python (Pandas)',
      'Capital IQ', 'FactSet', 'Hyperion', 'Essbase',
    ],
    soft: [
      'Analytical thinking', 'Attention to detail', 'Communication',
      'Problem-solving', 'Time management', 'Integrity', 'Discretion',
      'Interpersonal skills', 'Critical thinking',
    ],
    certifications: [
      'CPA', 'CFA', 'FRM', 'CFP', 'CIA', 'CMA', 'Series 7', 'Series 63',
    ],
    methodologies: [
      'GAAP', 'IFRS', 'SOX', 'Internal Controls', 'Risk Management',
      'Financial Planning & Analysis (FP&A)', 'Budget Management',
    ],
  },

  marketing: {
    mustHave: [
      'Digital Marketing', 'SEO', 'SEM', 'Content Marketing',
      'Social Media Marketing', 'Email Marketing', 'Marketing Analytics',
      'A/B Testing', 'Marketing Automation', 'CRM', 'Lead Generation',
    ],
    technical: [
      'Google Analytics', 'Google Ads', 'Facebook Ads', 'LinkedIn Ads',
      'HubSpot', 'Salesforce', 'Marketo', 'Mailchimp', 'SEMrush',
      'Hootsuite', 'Buffer', 'Canva', 'Adobe Creative Suite',
      'WordPress', 'HTML', 'CSS', 'JavaScript',
    ],
    soft: [
      'Creativity', 'Communication', 'Strategic thinking', 'Analytical skills',
      'Collaboration', 'Project management', 'Adaptability', 'Storytelling',
    ],
    certifications: [
      'Google Analytics Certified', 'Google Ads Certified',
      'HubSpot Inbound Certified', 'Facebook Blueprint Certified',
      'Hootsuite Certified', 'Content Marketing Certified',
    ],
    methodologies: [
      'Inbound Marketing', 'Account-Based Marketing (ABM)', 'Growth Hacking',
      'Conversion Rate Optimization', 'Marketing Funnel', 'Customer Journey',
    ],
  },

  sales: {
    mustHave: [
      'Sales', 'Business Development', 'Account Management', 'CRM',
      'Salesforce', 'Prospecting', 'Lead Generation', 'Negotiation',
      'Closing', 'Pipeline Management', 'Revenue Growth',
    ],
    technical: [
      'Salesforce', 'HubSpot CRM', 'Microsoft Dynamics', 'Pipedrive',
      'Outreach.io', 'SalesLoft', 'LinkedIn Sales Navigator',
      'ZoomInfo', 'Clearbit', 'SQL (for data analysis)',
    ],
    soft: [
      'Communication', 'Negotiation', 'Persuasion', 'Relationship building',
      'Active listening', 'Problem-solving', 'Resilience', 'Time management',
      'Emotional intelligence', 'Adaptability',
    ],
    certifications: [
      'Salesforce Certified', 'HubSpot Sales Certified',
      'SPIN Selling Certified', 'Challenger Sales',
    ],
    methodologies: [
      'SPIN Selling', 'MEDDIC', 'Challenger Sale', 'Solution Selling',
      'Value-Based Selling', 'Consultative Selling', 'Account-Based Selling',
    ],
  },

  healthcare: {
    mustHave: [
      'Patient Care', 'Electronic Health Records (EHR)', 'HIPAA',
      'Clinical Documentation', 'Medical Terminology', 'Healthcare Compliance',
      'Patient Safety', 'Quality Assurance', 'Care Coordination',
    ],
    technical: [
      'Epic', 'Cerner', 'Meditech', 'Allscripts', 'eClinicalWorks',
      'Medical coding (ICD-10, CPT)', 'Laboratory equipment',
      'Diagnostic tools', 'Telehealth platforms',
    ],
    soft: [
      'Compassion', 'Communication', 'Attention to detail', 'Critical thinking',
      'Teamwork', 'Stress management', 'Adaptability', 'Patient advocacy',
    ],
    certifications: [
      'RN (Registered Nurse)', 'LPN', 'CNA', 'NP (Nurse Practitioner)',
      'BLS', 'ACLS', 'PALS', 'CMA (Certified Medical Assistant)',
    ],
    methodologies: [
      'Evidence-Based Practice', 'Patient-Centered Care', 'Quality Improvement',
      'Risk Management', 'Infection Control', 'Care Transitions',
    ],
  },

  education: {
    mustHave: [
      'Curriculum Development', 'Lesson Planning', 'Classroom Management',
      'Student Assessment', 'Differentiated Instruction', 'Educational Technology',
      'Student Engagement', 'Parent Communication',
    ],
    technical: [
      'Google Classroom', 'Canvas', 'Blackboard', 'Zoom', 'Microsoft Teams',
      'Kahoot', 'Quizlet', 'Nearpod', 'Edmodo', 'PowerPoint',
      'Smart Boards', 'Learning Management Systems (LMS)',
    ],
    soft: [
      'Communication', 'Patience', 'Creativity', 'Adaptability',
      'Organization', 'Empathy', 'Conflict resolution', 'Leadership',
    ],
    certifications: [
      'Teaching License', 'State Certification', 'ESL Certification',
      'Special Education Certification', 'Google Certified Educator',
    ],
    methodologies: [
      'Project-Based Learning', 'Inquiry-Based Learning', 'Differentiated Instruction',
      'STEM Education', 'Universal Design for Learning (UDL)',
      'Response to Intervention (RTI)', 'Social-Emotional Learning (SEL)',
    ],
  },

  humanResources: {
    mustHave: [
      'Recruitment', 'Talent Acquisition', 'Employee Relations', 'HRIS',
      'Performance Management', 'Compensation & Benefits', 'Training & Development',
      'Compliance', 'Onboarding', 'Employee Engagement',
    ],
    technical: [
      'Workday', 'ADP', 'BambooHR', 'Greenhouse', 'Lever', 'iCIMS',
      'LinkedIn Recruiter', 'Applicant Tracking System (ATS)',
      'HRIS', 'Payroll systems', 'Excel', 'SQL',
    ],
    soft: [
      'Communication', 'Conflict resolution', 'Empathy', 'Discretion',
      'Interpersonal skills', 'Organizational skills', 'Adaptability',
      'Problem-solving', 'Negotiation',
    ],
    certifications: [
      'SHRM-CP', 'SHRM-SCP', 'PHR', 'SPHR', 'CIPD',
      'Certified Recruiter (CR)', 'LinkedIn Certified Professional',
    ],
    methodologies: [
      'Competency-Based Recruitment', 'Behavioral Interviewing',
      'Performance Management Systems', 'Talent Management',
      'Succession Planning', 'Employee Lifecycle Management',
    ],
  },

  projectManagement: {
    mustHave: [
      'Project Management', 'Agile', 'Scrum', 'Waterfall', 'Stakeholder Management',
      'Risk Management', 'Budget Management', 'Timeline Management',
      'Resource Allocation', 'Project Planning',
    ],
    technical: [
      'Jira', 'Asana', 'Monday.com', 'MS Project', 'Trello', 'Basecamp',
      'Confluence', 'Gantt charts', 'Excel', 'PowerPoint', 'Smartsheet',
    ],
    soft: [
      'Leadership', 'Communication', 'Problem-solving', 'Negotiation',
      'Organization', 'Time management', 'Adaptability', 'Critical thinking',
      'Team building', 'Conflict resolution',
    ],
    certifications: [
      'PMP (Project Management Professional)', 'PRINCE2', 'CSM (Certified Scrum Master)',
      'PMI-ACP', 'CAPM', 'Lean Six Sigma',
    ],
    methodologies: [
      'Agile', 'Scrum', 'Kanban', 'Waterfall', 'PRINCE2', 'Lean', 'Six Sigma',
      'Critical Path Method (CPM)', 'Earned Value Management (EVM)',
    ],
  },

  operations: {
    mustHave: [
      'Operations Management', 'Process Improvement', 'Supply Chain Management',
      'Inventory Management', 'Quality Control', 'Logistics', 'Vendor Management',
      'Cost Reduction', 'Efficiency Optimization', 'KPI Tracking',
    ],
    technical: [
      'ERP Systems', 'SAP', 'Oracle', 'Lean Six Sigma', 'MS Excel',
      'SQL', 'Tableau', 'Power BI', 'Inventory Management Systems',
      'WMS (Warehouse Management System)', 'TMS (Transportation Management System)',
    ],
    soft: [
      'Analytical thinking', 'Problem-solving', 'Communication', 'Leadership',
      'Organization', 'Attention to detail', 'Time management', 'Adaptability',
    ],
    certifications: [
      'Lean Six Sigma (Green Belt, Black Belt)', 'APICS CPIM', 'CSCP',
      'PMP', 'CPSM (Certified Professional in Supply Management)',
    ],
    methodologies: [
      'Lean Manufacturing', 'Six Sigma', 'Kaizen', 'Just-in-Time (JIT)',
      'Total Quality Management (TQM)', '5S', 'Value Stream Mapping',
    ],
  },

  dataScience: {
    mustHave: [
      'Data Analysis', 'Machine Learning', 'Statistical Modeling', 'Data Visualization',
      'Python', 'R', 'SQL', 'Big Data', 'Predictive Analytics', 'A/B Testing',
    ],
    technical: [
      'Python (Pandas, NumPy, Scikit-learn)', 'R', 'SQL', 'TensorFlow', 'PyTorch',
      'Jupyter', 'Tableau', 'Power BI', 'Excel', 'SAS', 'SPSS',
      'Hadoop', 'Spark', 'Kafka', 'AWS', 'Azure ML', 'GCP',
    ],
    soft: [
      'Analytical thinking', 'Problem-solving', 'Communication', 'Curiosity',
      'Attention to detail', 'Collaboration', 'Creativity', 'Critical thinking',
    ],
    certifications: [
      'Google Data Analytics Certificate', 'Microsoft Certified: Azure Data Scientist',
      'AWS Certified Machine Learning', 'SAS Certified', 'Cloudera Certified',
    ],
    methodologies: [
      'CRISP-DM', 'Agile Data Science', 'Experimental Design', 'A/B Testing',
      'Feature Engineering', 'Model Validation', 'Cross-Validation',
    ],
  },

  customerService: {
    mustHave: [
      'Customer Service', 'Customer Support', 'Problem Resolution', 'CRM',
      'Client Relations', 'Communication', 'Active Listening', 'Conflict Resolution',
      'Customer Satisfaction', 'Ticketing Systems',
    ],
    technical: [
      'Zendesk', 'Salesforce Service Cloud', 'Freshdesk', 'Intercom',
      'LiveChat', 'Help Scout', 'Jira Service Desk', 'Microsoft Dynamics',
      'Phone systems', 'Chat support tools',
    ],
    soft: [
      'Communication', 'Empathy', 'Patience', 'Problem-solving', 'Active listening',
      'Adaptability', 'Conflict resolution', 'Positive attitude', 'Time management',
    ],
    certifications: [
      'Certified Customer Service Professional (CCSP)', 'HDI Customer Service Representative',
      'Salesforce Service Cloud Certified', 'Zendesk Certification',
    ],
    methodologies: [
      'Customer-Centric Approach', 'Service Recovery', 'First Call Resolution (FCR)',
      'Net Promoter Score (NPS)', 'Customer Effort Score (CES)',
    ],
  },
}

/**
 * Get ATS keywords for a specific industry
 */
export function getATSKeywordsByIndustry(industry: string): ATSKeywordSet | null {
  const normalizedIndustry = industry.toLowerCase().replace(/\s+/g, '')
  const industryKey = Object.keys(ATS_KEYWORDS_BY_INDUSTRY).find(
    key => key.toLowerCase() === normalizedIndustry
  )
  return industryKey ? ATS_KEYWORDS_BY_INDUSTRY[industryKey] : null
}

/**
 * Get all keywords for an industry (flattened)
 */
export function getAllKeywords(industry: string): string[] {
  const keywords = getATSKeywordsByIndustry(industry)
  if (!keywords) return []

  return [
    ...keywords.mustHave,
    ...keywords.technical,
    ...keywords.soft,
    ...(keywords.certifications || []),
    ...(keywords.methodologies || []),
  ]
}

/**
 * Check if resume contains required keywords for an industry
 */
export function checkKeywordCoverage(
  resumeText: string,
  industry: string
): {
  coverage: number
  matched: string[]
  missing: string[]
  mustHaveMissing: string[]
} {
  const keywords = getATSKeywordsByIndustry(industry)
  if (!keywords) {
    return { coverage: 0, matched: [], missing: [], mustHaveMissing: [] }
  }

  const resumeLower = resumeText.toLowerCase()
  const allKeywords = getAllKeywords(industry)

  const matched = allKeywords.filter(keyword =>
    resumeLower.includes(keyword.toLowerCase())
  )

  const missing = allKeywords.filter(keyword =>
    !resumeLower.includes(keyword.toLowerCase())
  )

  const mustHaveMissing = keywords.mustHave.filter(keyword =>
    !resumeLower.includes(keyword.toLowerCase())
  )

  const coverage = (matched.length / allKeywords.length) * 100

  return {
    coverage: Math.round(coverage),
    matched,
    missing,
    mustHaveMissing,
  }
}

/**
 * Get available industries
 */
export function getAvailableIndustries(): string[] {
  return Object.keys(ATS_KEYWORDS_BY_INDUSTRY)
}
