/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Clock, 
  Trash2, 
  Settings, 
  Search, 
  Bell, 
  Plus, 
  Folder, 
  MoreVertical, 
  Grid, 
  List, 
  Download, 
  Share2, 
  Info,
  ChevronRight,
  File,
  FileImage,
  FileVideo,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  History,
  GitPullRequest,
  BarChart3,
  Eye,
  Lock,
  Unlock,
  FileCheck,
  Calendar,
  UserCheck,
  ArrowRight,
  Circle,
  RotateCcw,
  Check,
  MessageSquare,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

// --- Types ---

type FileType = 'folder' | 'pdf' | 'image' | 'video' | 'doc';
type DocStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Archived' | 'Legal Hold';

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

interface Version {
  version: string;
  updatedAt: string;
  updatedBy: string;
  comment: string;
}

interface DocItem {
  id: string;
  name: string;
  type: FileType;
  size?: string;
  updatedAt: string;
  owner: string;
  status: DocStatus;
  sharedWith?: string[];
  tags?: string[];
  template?: string;
  retentionDate?: string;
  legalHold?: boolean;
  deleted?: boolean;
  versions: Version[];
  auditTrail: AuditEntry[];
  client?: string;
  matter?: string;
  author?: string;
  practiceArea?: string;
  comments?: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer' | 'Compliance Officer';
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  avatar: string;
  color: string;
  initial: string;
}

// --- Mock Data ---

const MOCK_DOCS: DocItem[] = [
  { 
    id: '1', name: 'Project Proposals', type: 'folder', updatedAt: '2023-10-24', owner: 'Me', status: 'Approved',
    versions: [], auditTrail: []
  },
  { 
    id: '3', name: 'Brand Guidelines.pdf', type: 'pdf', size: '2.4 MB', updatedAt: '2023-10-25', owner: 'Me', status: 'Approved',
    tags: ['Design', 'Official'], template: 'Corporate Identity', retentionDate: '2030-10-25',
    client: 'Acme Corp', matter: 'General Legal', author: 'Sarah Chen',
    versions: [
      { version: '2.0', updatedAt: '2023-10-25', updatedBy: 'Me', comment: 'Final approval' },
      { version: '1.0', updatedAt: '2023-10-10', updatedBy: 'Sarah Chen', comment: 'Initial draft' }
    ],
    auditTrail: [
      { id: 'a1', action: 'Viewed', user: 'John Doe', timestamp: '2023-10-26 14:20' },
      { id: 'a2', action: 'Approved', user: 'Me', timestamp: '2023-10-25 09:15' }
    ]
  },
  { 
    id: '6', name: 'Contract_Draft_v2.docx', type: 'doc', size: '156 KB', updatedAt: '2023-10-26', owner: 'Me', status: 'Pending Approval',
    sharedWith: ['John Doe'], template: 'Legal Contract', legalHold: true,
    client: 'Globex Corporation', matter: 'M&A Advisory', author: 'Me', practiceArea: 'Corporate',
    versions: [{ version: '1.0', updatedAt: '2023-10-26', updatedBy: 'Me', comment: 'Draft for review' }],
    auditTrail: [
      { id: 'a3', action: 'Legal Hold Applied', user: 'Compliance Officer', timestamp: '2023-10-27 10:00' },
      { id: 'a4', action: 'Created', user: 'Me', timestamp: '2023-10-26 16:45' }
    ]
  },
  { 
    id: '8', name: 'Meeting_Notes_Oct.pdf', type: 'pdf', size: '890 KB', updatedAt: '2023-10-26', owner: 'Me', status: 'Draft',
    versions: [], auditTrail: []
  },
  { 
    id: '9', name: 'Invoice_Nov_2023.pdf', type: 'pdf', size: '1.1 MB', updatedAt: '2023-11-02', owner: 'Me', status: 'Approved',
    versions: [], auditTrail: []
  },
  { 
    id: '10', name: 'Product_Roadmap_2024.doc', type: 'doc', size: '2.1 MB', updatedAt: '2023-11-05', owner: 'Sarah Chen', status: 'Draft',
    versions: [], auditTrail: []
  },
  { 
    id: '11', name: 'Security_Audit_Report.pdf', type: 'pdf', size: '4.5 MB', updatedAt: '2023-11-10', owner: 'Me', status: 'Legal Hold',
    versions: [], auditTrail: []
  },
  { 
    id: '12', name: 'Old_Draft_2022.doc', type: 'doc', size: '45 KB', updatedAt: '2022-05-12', owner: 'Me', status: 'Archived',
    deleted: true, versions: [], auditTrail: []
  },
  { 
    id: '13', name: 'Team_Sync_Notes.pdf', type: 'pdf', size: '1.2 MB', updatedAt: '2023-11-15', owner: 'Sarah Chen', status: 'Approved',
    sharedWith: ['Me'], versions: [], auditTrail: []
  },
];

const MOCK_CLIENTS = ['Acme Corp', 'Globex Corporation', 'Soylent Corp', 'Initech'];
const MOCK_MATTERS = ['General Legal', 'Intellectual Property', 'Litigation - 2024', 'M&A Advisory'];
const MOCK_DOC_TYPES = ['Agreement', 'Pleading', 'Correspondence', 'Research Memo', 'Internal Draft'];
const MOCK_PRACTICE_AREAS = ['Corporate', 'Litigation', 'Intellectual Property', 'Real Estate', 'Tax'];

const MOCK_USERS: UserItem[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah.c@docuflow.com', role: 'Admin', status: 'Active', lastLogin: '2 mins ago', avatar: '', color: 'bg-emerald-100 text-emerald-700', initial: 'SC' },
  { id: 'u2', name: 'Michael Ross', email: 'm.ross@docuflow.com', role: 'Editor', status: 'Active', lastLogin: '1 hour ago', avatar: '', color: 'bg-blue-100 text-blue-700', initial: 'MR' },
  { id: 'u3', name: 'Elena Rodriguez', email: 'elena.r@docuflow.com', role: 'Compliance Officer', status: 'Active', lastLogin: '3 hours ago', avatar: '', color: 'bg-purple-100 text-purple-700', initial: 'ER' },
  { id: 'u4', name: 'David Kim', email: 'd.kim@docuflow.com', role: 'Viewer', status: 'Inactive', lastLogin: '2 days ago', avatar: '', color: 'bg-slate-100 text-slate-700', initial: 'DK' },
  { id: 'u5', name: 'James Wilson', email: 'j.wilson@docuflow.com', role: 'Editor', status: 'Pending', lastLogin: 'Never', avatar: '', color: 'bg-amber-100 text-amber-700', initial: 'JW' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-emerald-50 text-emerald-700 font-medium' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-emerald-600' : 'text-slate-400'} />
    <span className="text-sm">{label}</span>
  </button>
);

const FileIcon = ({ type, size = 24 }: { type: FileType, size?: number }) => {
  switch (type) {
    case 'folder': return <Folder size={size} className="text-amber-400 fill-amber-400" />;
    case 'pdf': return <FileText size={size} className="text-rose-500" />;
    case 'image': return <FileImage size={size} className="text-blue-500" />;
    case 'video': return <FileVideo size={size} className="text-purple-500" />;
    default: return <File size={size} className="text-slate-400" />;
  }
};

export default function App() {
  const [docs, setDocs] = useState<DocItem[]>(MOCK_DOCS);
  const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [workflowDocId, setWorkflowDocId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'audit' | 'versions'>('info');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('Legal Contract');
  const [metadata, setMetadata] = useState({
    client: '',
    matter: '',
    author: 'Me',
    docType: '',
    comments: '',
    practiceArea: ''
  });

  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !filterStatus || doc.status === filterStatus;
      const matchesType = !filterType || doc.type.toLowerCase() === filterType.toLowerCase();
      
      // Tab specific filtering
      if (activeTab === 'Trash') return matchesSearch && doc.deleted;
      if (doc.deleted) return false; // Hide deleted from other tabs

      if (activeTab === 'Shared') return matchesSearch && doc.sharedWith?.includes('Me');
      if (activeTab === 'Recent') return matchesSearch; // Could add date logic here
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [docs, searchQuery, filterStatus, filterType, activeTab]);

  const handleRestore = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, deleted: false } : d));
  };

  const handlePermanentDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleSoftDelete = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, deleted: true } : d));
    setSelectedFile(null);
  };

  const handleUpload = () => {
    const newDoc: DocItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Invoice_2023.pdf',
      type: 'pdf',
      size: '1.2 MB',
      updatedAt: new Date().toISOString().split('T')[0],
      owner: 'Me',
      status: 'Approved',
      template: 'Financial Report',
      versions: [{ version: '1.0', updatedAt: new Date().toISOString().split('T')[0], updatedBy: 'Me', comment: 'Initial upload' }],
      auditTrail: [{ id: 'a' + Date.now(), action: 'Ingested', user: 'Me', timestamp: new Date().toLocaleString() }]
    };
    setDocs([newDoc, ...docs]);
    setIsUploadModalOpen(false);
  };

  const handleStartWorkflow = (docId: string, template: string) => {
    setDocs(prevDocs => prevDocs.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: 'Pending Approval',
          template: template,
          auditTrail: [
            { id: 'a' + Date.now(), action: 'Workflow Started', user: 'Me', timestamp: new Date().toLocaleString() },
            ...doc.auditTrail
          ]
        };
      }
      return doc;
    }));
    setIsWorkflowModalOpen(false);
    setWorkflowDocId(null);
    setActiveTab('Workflows');
    setWorkflowStep(2);
    setSelectedWorkflowId(docId);
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm"><FileText size={20} /></div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">+12%</span>
                </div>
                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Documents</h4>
                <p className="text-3xl font-bold text-slate-800">{docs.length}</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white rounded-lg text-amber-600 shadow-sm"><GitPullRequest size={20} /></div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">5 Pending</span>
                </div>
                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Workflows</h4>
                <p className="text-3xl font-bold text-slate-800">24</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white rounded-lg text-rose-600 shadow-sm"><ShieldCheck size={20} /></div>
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Secure</span>
                </div>
                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Compliance Score</h4>
                <p className="text-3xl font-bold text-slate-800">98%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" /> Recent Activity
                </h3>
                <div className="space-y-4">
                  {docs.slice(0, 3).map(doc => (
                    <div 
                      key={doc.id} 
                      onClick={() => {
                        setSelectedFile(doc);
                        setDetailTab('info');
                      }}
                      className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors rounded-lg px-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                        {doc.owner === 'Me' ? 'ME' : doc.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">
                          <span className="font-bold">{doc.owner}</span> 
                          {doc.status === 'Approved' ? ' approved ' : ' updated '} 
                          <span className="text-emerald-600 font-medium">{doc.name}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">{doc.updatedAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-slate-400" /> Storage Usage
                </h3>
                <div className="h-48 flex items-end gap-4 px-4">
                  {[40, 65, 45, 80, 55, 70, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-100 rounded-t-lg relative group transition-all hover:bg-emerald-500">
                      <div style={{ height: `${h}%` }} className="w-full bg-emerald-500 rounded-t-lg opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Workflows':
        const pendingDocs = docs.filter(d => d.status === 'Pending Approval');
        
        if (selectedWorkflowId) {
          const workflowDoc = docs.find(d => d.id === selectedWorkflowId);
          if (!workflowDoc) {
            setSelectedWorkflowId(null);
            return null;
          }

          const steps = [
            { id: 1, name: 'Submission', status: 'completed', user: 'Ram Kiran', date: 'Oct 24, 2023' },
            { id: 2, name: 'Compliance Review', status: workflowStep > 2 ? 'completed' : (workflowStep === 2 ? 'active' : 'pending'), user: 'Sarah Chen', date: 'Oct 25, 2023' },
            { id: 3, name: 'Legal Approval', status: workflowStep > 3 ? 'completed' : (workflowStep === 3 ? 'active' : 'pending'), user: 'Michael Ross', date: 'Oct 26, 2023' },
            { id: 4, name: 'Final Sign-off', status: workflowStep > 4 ? 'completed' : (workflowStep === 4 ? 'active' : 'pending'), user: 'Executive Board', date: 'Oct 27, 2023' },
          ];

          return (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setSelectedWorkflowId(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <ArrowRight className="rotate-180" size={20} />
                </button>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{workflowDoc.name}</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{workflowDoc.template || 'General Review'} Workflow</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <MessageSquare size={16} /> Comment
                  </button>
                  <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <History size={16} /> History
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <GitPullRequest size={18} className="text-emerald-500" /> Workflow Progress
                    </h4>
                    <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {steps.map((step) => (
                        <div key={step.id} className="relative flex gap-4">
                          <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                            step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                            step.status === 'active' ? 'bg-white border-emerald-500 text-emerald-500' :
                            'bg-white border-slate-200 text-slate-300'
                          }`}>
                            {step.status === 'completed' ? <Check size={14} /> : <span className="text-[10px] font-bold">{step.id}</span>}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                              {step.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {step.status === 'completed' ? `Completed by ${step.user}` : (step.status === 'active' ? `Assigned to ${step.user}` : 'Upcoming')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-800 mb-4 text-sm">Document Details</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Owner</span>
                        <span className="font-bold text-slate-700">{workflowDoc.owner}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Size</span>
                        <span className="font-bold text-slate-700">{workflowDoc.size}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Last Updated</span>
                        <span className="font-bold text-slate-700">{workflowDoc.updatedAt}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedFile(workflowDoc);
                        setIsPreviewOpen(true);
                      }}
                      className="w-full mt-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={14} /> View Document
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Current Step</span>
                        <h4 className="text-2xl font-bold text-slate-800">{steps[workflowStep - 1]?.name}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium mb-1">Due Date</p>
                        <p className="text-sm font-bold text-slate-700">Oct 30, 2023</p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        "Please review the attached compliance documentation for the Q4 project. Ensure all regulatory requirements are met and verify the signatures on page 12."
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Review Comments</label>
                      <textarea 
                        placeholder="Add your notes or feedback here..."
                        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm min-h-[120px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => {
                          if (workflowStep < 4) {
                            setWorkflowStep(prev => prev + 1);
                          } else {
                            setDocs(prev => prev.map(d => d.id === selectedWorkflowId ? { ...d, status: 'Approved' } : d));
                            setSelectedWorkflowId(null);
                          }
                        }}
                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} /> {workflowStep === 4 ? 'Final Approval' : 'Approve & Continue'}
                      </button>
                      <button className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                        <RotateCcw size={18} /> Request Changes
                      </button>
                      <button className="px-6 py-3 border border-rose-100 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all flex items-center gap-2">
                        <X size={18} /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Users size={18} className="text-slate-400" /> Stakeholders
                    </h4>
                    <div className="flex gap-4">
                      {[
                        { name: 'Sarah Chen', role: 'Compliance', initial: 'SC', color: 'bg-blue-100 text-blue-600' },
                        { name: 'Michael Ross', role: 'Legal', initial: 'MR', color: 'bg-purple-100 text-purple-600' },
                        { name: 'Ram Kiran', role: 'Owner', initial: 'RK', color: 'bg-emerald-100 text-emerald-600' },
                      ].map(user => (
                        <div key={user.name} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.color}`}>
                            {user.initial}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{user.role}</p>
                          </div>
                        </div>
                      ))}
                      <button className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                        <UserPlus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

        return (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Active Workflows</h3>
              <button 
                onClick={() => setIsWorkflowModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all"
              >
                Start Workflow
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Workflow Type</th>
                    <th className="px-6 py-4">Current Step</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDocs.length > 0 ? pendingDocs.map(doc => (
                    <tr 
                      key={doc.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedWorkflowId(doc.id);
                        setWorkflowStep(2);
                      }}
                    >
                      <td className="px-6 py-4 font-medium text-slate-700">{doc.name}</td>
                      <td className="px-6 py-4 text-slate-500">{doc.template || 'General Review'}</td>
                      <td className="px-6 py-4 text-slate-500">Compliance Check</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">SC</div>
                        Sarah Chen
                      </td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wider">In Progress</span></td>
                      <td className="px-6 py-4 text-right">
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors inline-block" />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                        <GitPullRequest size={48} className="mx-auto mb-4 opacity-10" />
                        No active workflows found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Audit Logs':
        const now = new Date().toISOString().replace('T', ' ').split('.')[0];
        return (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">System Audit Logs</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Export PDF</button>
                <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Export CSV</button>
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 font-mono text-xs text-emerald-400 overflow-x-auto">
              <p className="mb-2 opacity-50"># Immutable Audit Trail - DMS</p>
              <p className="mb-1">[{now}] ACTION: SYSTEM_READY | USER: sys_admin | STATUS: OK</p>
              {docs.slice(0, 5).map(doc => (
                <p key={doc.id} className="mb-1">[{doc.updatedAt} 09:00:00] ACTION: DOC_UPDATED | USER: {doc.owner.toLowerCase().replace(' ', '_')} | DOC_ID: {doc.id} | STATUS: {doc.status}</p>
              ))}
              <p className="animate-pulse">_</p>
            </div>
          </div>
        );
      case 'Records Mgmt':
        return (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Records Management</h3>
              <button className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-rose-700 transition-all">Apply Global Hold</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={18} className="text-rose-500" /> Retention Policies</h4>
                <div className="space-y-3">
                  {['Financial Records (7 Years)', 'Employee Data (5 Years)', 'Legal Contracts (Permanent)'].map(p => (
                    <div key={p} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-sm text-slate-700 font-medium">{p}</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Active</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Trash2 size={18} className="text-slate-400" /> Disposition Queue</h4>
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 italic text-sm">
                  No records currently eligible for disposition.
                </div>
              </div>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl">
            <h3 className="text-xl font-bold text-slate-800 mb-8">System Settings</h3>
            <div className="space-y-8">
              <section className="bg-white border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={18} className="text-slate-400" /> Profile Settings</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input type="text" defaultValue="Ram Kiran" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input type="email" defaultValue="ramkirank@gmail.com" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-slate-400" /> Security & Access</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-400">Add an extra layer of security to your account.</p>
                    </div>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Session Timeout</p>
                      <p className="text-xs text-slate-400">Automatically log out after inactivity.</p>
                    </div>
                    <select className="bg-white border border-slate-200 rounded-lg text-xs p-1 font-medium">
                      <option>15 Minutes</option>
                      <option>30 Minutes</option>
                      <option>1 Hour</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Bell size={18} className="text-slate-400" /> Notifications</h4>
                <div className="space-y-3">
                  {['Email on Approval', 'System Audit Alerts', 'Workflow Reminders'].map(n => (
                    <label key={n} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 border-2 border-slate-300 rounded group-hover:border-emerald-500 transition-colors" />
                      <span className="text-sm text-slate-600">{n}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      );
      case 'Notifications':
        const notifications = [
          { id: 1, title: 'Document Approved', message: 'Sarah Chen approved "Project_Alpha_Specs.pdf"', time: '2 mins ago', type: 'success' },
          { id: 2, title: 'New Shared File', message: 'Michael Ross shared "Q4_Budget_Draft.xlsx" with you', time: '1 hour ago', type: 'info' },
          { id: 3, title: 'Security Alert', message: 'New login detected from a new device in San Francisco', time: '3 hours ago', type: 'warning' },
          { id: 4, title: 'Workflow Reminder', message: 'You have 3 documents pending review in "Legal Review" workflow', time: '5 hours ago', type: 'info' },
        ];
        return (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-800">Notifications</h3>
              <button className="text-xs font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-700">Mark all as read</button>
            </div>
            <div className="space-y-4">
              {notifications.map(n => (
                <div key={n.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                    n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                    n.type === 'warning' ? 'bg-rose-100 text-rose-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {n.type === 'success' ? <CheckCircle2 size={20} /> : n.type === 'warning' ? <AlertCircle size={20} /> : <Bell size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      case 'Reports':
        if (selectedReportType) {
          const storageData = [
            { name: 'Oct', size: 12.5 },
            { name: 'Nov', size: 13.8 },
            { name: 'Dec', size: 14.2 },
            { name: 'Jan', size: 14.8 },
            { name: 'Feb', size: 15.2 },
          ];

          const activityData = [
            { name: 'Mon', uploads: 12, views: 45, approvals: 4 },
            { name: 'Tue', uploads: 18, views: 52, approvals: 8 },
            { name: 'Wed', uploads: 15, views: 38, approvals: 6 },
            { name: 'Thu', uploads: 22, views: 65, approvals: 12 },
            { name: 'Fri', uploads: 10, views: 30, approvals: 5 },
          ];

          const complianceData = [
            { name: 'Approved', value: 65 },
            { name: 'Pending', value: 20 },
            { name: 'Draft', value: 10 },
            { name: 'Legal Hold', value: 5 },
          ];

          const COLORS = ['#10b981', '#f59e0b', '#64748b', '#ef4444'];

          return (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setSelectedReportType(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
                <h3 className="text-xl font-bold text-slate-800">{selectedReportType} Report</h3>
              </div>

              {selectedReportType === 'Storage Growth' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Storage</p>
                      <p className="text-2xl font-bold text-slate-800">15.2 GB</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Growth</p>
                      <p className="text-2xl font-bold text-emerald-600">+2.4%</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg File Size</p>
                      <p className="text-2xl font-bold text-slate-800">2.1 MB</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Remaining</p>
                      <p className="text-2xl font-bold text-amber-600">4.8 GB</p>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 h-96">
                    <h4 className="font-bold text-slate-800 mb-6">Storage Trend (GB)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={storageData}>
                        <defs>
                          <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="size" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSize)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {selectedReportType === 'User Activity' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Users</p>
                      <p className="text-2xl font-bold text-slate-800">124</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Views</p>
                      <p className="text-2xl font-bold text-slate-800">1,240</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Approvals</p>
                      <p className="text-2xl font-bold text-emerald-600">42</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Session</p>
                      <p className="text-2xl font-bold text-slate-800">12m</p>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 h-96">
                    <h4 className="font-bold text-slate-800 mb-6">Daily Interactions</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="uploads" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="approvals" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {selectedReportType === 'Compliance Audit' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 h-96">
                    <h4 className="font-bold text-slate-800 mb-6">Document Status Distribution</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={complianceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {complianceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-6">Compliance Checklist</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Retention Policies Applied', status: 'Pass' },
                        { label: 'Audit Logging Enabled', status: 'Pass' },
                        { label: 'Encryption at Rest', status: 'Pass' },
                        { label: 'User Access Reviews', status: 'Pending' },
                        { label: 'Data Disposition Records', status: 'Pass' }
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm font-medium text-slate-700">{item.label}</span>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="flex-1 overflow-y-auto p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6">System Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Storage Growth', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                { title: 'User Activity', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { title: 'Compliance Audit', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' }
              ].map(report => (
                <button 
                  key={report.title} 
                  onClick={() => setSelectedReportType(report.title)}
                  className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className={`w-10 h-10 ${report.bg} ${report.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <report.icon size={20} />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{report.title}</h4>
                  <p className="text-xs text-slate-400">Generate detailed analytics for {report.title.toLowerCase()}.</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 'Users':
        return (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">User Management</h3>
                <p className="text-sm text-slate-500 mt-1">Manage system access, roles, and permissions.</p>
              </div>
              <button 
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
              >
                <UserPlus size={20} />
                Add New User
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active Now', value: '3', icon: Circle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Pending Invites', value: '1', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Admins', value: '1', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(stat => (
                <div key={stat.label} className={`${stat.bg} p-4 rounded-2xl border border-white/50 shadow-sm`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 bg-white rounded-lg ${stat.color} shadow-sm`}><stat.icon size={16} /></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Login</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.color}`}>
                            {user.initial}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                          user.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">{user.lastLogin}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                            <Settings size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 flex overflow-hidden">
            {/* Facets Sidebar */}
            <div className="w-64 border-r border-slate-100 p-6 space-y-8 overflow-y-auto hidden xl:block">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Metadata Facets</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Status</label>
                    <div className="space-y-2">
                      {['All', 'Approved', 'Pending Approval', 'Draft', 'Legal Hold'].map(s => (
                        <label key={s} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-emerald-600">
                          <input 
                            type="radio" 
                            name="status"
                            checked={s === 'All' ? !filterStatus : filterStatus === s}
                            onChange={() => setFilterStatus(s === 'All' ? null : s)}
                            className="rounded-full border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                          />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Document Type</label>
                    <div className="space-y-2">
                      {['All', 'PDF', 'Doc', 'Image', 'Video'].map(t => (
                        <label key={t} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-emerald-600">
                          <input 
                            type="radio" 
                            name="type"
                            checked={t === 'All' ? !filterType : filterType === t}
                            onChange={() => setFilterType(t === 'All' ? null : t)}
                            className="rounded-full border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setFilterStatus(null);
                  setFilterType(null);
                  setSearchQuery('');
                }}
                className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Clear All Filters
              </button>
            </div>

            {/* Files Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDocs.map((doc) => (
                    <motion.div
                      layoutId={doc.id}
                      key={doc.id}
                      onClick={() => setSelectedFile(doc)}
                      className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedFile?.id === doc.id 
                          ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200' 
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${doc.type === 'folder' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                          <FileIcon type={doc.type} size={28} />
                        </div>
                        <div className="flex gap-1">
                          {doc.legalHold && <Lock size={14} className="text-rose-500" />}
                          <button className="p-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-800 truncate mb-1" title={doc.name}>
                        {doc.name}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>{doc.type === 'folder' ? 'Folder' : doc.size}</span>
                        <span className={doc.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'}>{doc.status}</span>
                      </div>
                      {activeTab === 'Trash' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRestore(doc.id); }}
                            className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-100 transition-colors"
                          >
                            Restore
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handlePermanentDelete(doc.id); }}
                            className="flex-1 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Modified</th>
                        <th className="px-6 py-3">Size</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDocs.map((doc) => (
                        <tr 
                          key={doc.id} 
                          onClick={() => setSelectedFile(doc)}
                          className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedFile?.id === doc.id ? 'bg-emerald-50' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <FileIcon type={doc.type} size={20} />
                              <span className="font-medium text-slate-700">{doc.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>{doc.status}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{doc.updatedAt}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{doc.type === 'folder' ? '--' : doc.size}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1 text-slate-400 hover:text-slate-600">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">DMS</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <SidebarItem icon={FileText} label="My Documents" active={activeTab === 'My Documents'} onClick={() => setActiveTab('My Documents')} />
          <SidebarItem icon={GitPullRequest} label="Workflows" active={activeTab === 'Workflows'} onClick={() => setActiveTab('Workflows')} />
          <SidebarItem icon={ShieldCheck} label="Audit Logs" active={activeTab === 'Audit Logs'} onClick={() => setActiveTab('Audit Logs')} />
          <SidebarItem icon={Lock} label="Records Mgmt" active={activeTab === 'Records Mgmt'} onClick={() => setActiveTab('Records Mgmt')} />
          <SidebarItem icon={BarChart3} label="Reports" active={activeTab === 'Reports'} onClick={() => setActiveTab('Reports')} />
          <SidebarItem icon={Users} label="User Management" active={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collections</div>
          <SidebarItem icon={Users} label="Shared with me" active={activeTab === 'Shared'} onClick={() => setActiveTab('Shared')} />
          <SidebarItem icon={Clock} label="Recent" active={activeTab === 'Recent'} onClick={() => setActiveTab('Recent')} />
          <SidebarItem icon={Trash2} label="Trash" active={activeTab === 'Trash'} onClick={() => setActiveTab('Trash')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Storage</span>
              <span>75% used</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-3/4" />
            </div>
            <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold">15.2 GB of 20 GB</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Bar */}
        <header className="h-16 border-bottom border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search documents, folders, tags..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4 ml-8">
            <button 
              onClick={() => setActiveTab('Notifications')}
              className={`p-2 hover:bg-slate-100 rounded-full relative transition-colors ${activeTab === 'Notifications' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500'}`}
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div 
              onClick={() => setActiveTab('Settings')}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm border cursor-pointer transition-all ${
                activeTab === 'Settings' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200' 
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
              }`}
            >
              RK
            </div>
          </div>
        </header>

        {/* Content Header */}
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <span>DMS</span>
              <ChevronRight size={14} />
              <span className="text-slate-600 font-medium">{activeTab}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium">
              <Filter size={16} />
              Filter
            </button>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-sm font-medium shadow-sm shadow-emerald-200"
            >
              <Plus size={18} />
              New
            </button>
          </div>
        </div>

        {/* Files Area */}
        {renderMainContent()}
      </main>

      {/* Details Sidebar */}
      <AnimatePresence>
        {selectedFile && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-2xl z-10"
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Details</h3>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col items-center mb-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-3 ${selectedFile.type === 'folder' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                  <FileIcon type={selectedFile.type} size={40} />
                </div>
                <h4 className="text-base font-bold text-slate-800 text-center break-all px-4">{selectedFile.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedFile.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    selectedFile.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700' :
                    selectedFile.status === 'Legal Hold' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedFile.status}
                  </span>
                  {selectedFile.legalHold && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                      <Lock size={10} /> Hold
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <button 
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <Eye size={16} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Preview</span>
                  </button>
                  <button 
                    onClick={() => {
                      setWorkflowDocId(selectedFile.id);
                      setIsWorkflowModalOpen(true);
                    }}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <GitPullRequest size={16} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Workflow</span>
                  </button>
                  <button 
                    onClick={() => setDetailTab('versions')}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <History size={16} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">History</span>
                  </button>
                  {!selectedFile.deleted && (
                    <button 
                      onClick={() => handleSoftDelete(selectedFile.id)}
                      className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-600 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Delete</span>
                    </button>
                  )}
                </div>

                {/* Tabs for Details */}
                <div className="space-y-4">
                  <div className="flex border-b border-slate-100">
                    <button 
                      onClick={() => setDetailTab('info')}
                      className={`flex-1 pb-2 text-[10px] font-bold uppercase tracking-wider transition-all ${detailTab === 'info' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Info
                    </button>
                    <button 
                      onClick={() => setDetailTab('audit')}
                      className={`flex-1 pb-2 text-[10px] font-bold uppercase tracking-wider transition-all ${detailTab === 'audit' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Audit
                    </button>
                    <button 
                      onClick={() => setDetailTab('versions')}
                      className={`flex-1 pb-2 text-[10px] font-bold uppercase tracking-wider transition-all ${detailTab === 'versions' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Versions
                    </button>
                  </div>

                  <div className="space-y-4 pt-2">
                    {detailTab === 'info' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-y-3 text-xs">
                          <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Template</div>
                          <div className="text-slate-700 font-medium text-right">{selectedFile.template || 'None'}</div>
                          
                          <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Retention</div>
                          <div className="text-slate-700 font-medium text-right">{selectedFile.retentionDate || 'Indefinite'}</div>
                          
                          <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Owner</div>
                          <div className="text-slate-700 font-medium text-right">{selectedFile.owner}</div>
                          
                          <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Modified</div>
                          <div className="text-slate-700 font-medium text-right">{selectedFile.updatedAt}</div>
                        </div>

                        {(selectedFile.client || selectedFile.matter || selectedFile.author) && (
                          <div className="pt-4 border-t border-slate-100 space-y-3">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Details</h5>
                            <div className="grid grid-cols-2 gap-y-3 text-xs">
                              {selectedFile.client && (
                                <>
                                  <div className="text-slate-400">Client</div>
                                  <div className="text-slate-700 font-medium text-right">{selectedFile.client}</div>
                                </>
                              )}
                              {selectedFile.matter && (
                                <>
                                  <div className="text-slate-400">Matter</div>
                                  <div className="text-slate-700 font-medium text-right">{selectedFile.matter}</div>
                                </>
                              )}
                              {selectedFile.author && (
                                <>
                                  <div className="text-slate-400">Author</div>
                                  <div className="text-slate-700 font-medium text-right">{selectedFile.author}</div>
                                </>
                              )}
                              {selectedFile.practiceArea && (
                                <>
                                  <div className="text-slate-400">Practice Area</div>
                                  <div className="text-slate-700 font-medium text-right">{selectedFile.practiceArea}</div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedFile.comments && (
                          <div className="pt-4 border-t border-slate-100">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Comments</h5>
                            <p className="text-xs text-slate-600 italic leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                              "{selectedFile.comments}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {detailTab === 'audit' && (
                      <div className="space-y-3">
                        {selectedFile.auditTrail.length > 0 ? selectedFile.auditTrail.map(a => (
                          <div key={a.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{a.action}</p>
                            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                              <span>{a.user}</span>
                              <span>{a.timestamp}</span>
                            </div>
                          </div>
                        )) : (
                          <p className="text-center py-4 text-xs text-slate-400 italic">No audit events recorded</p>
                        )}
                      </div>
                    )}

                    {detailTab === 'versions' && (
                      <div className="space-y-3">
                        {selectedFile.versions.length > 0 ? selectedFile.versions.map(v => (
                          <div key={v.version} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
                            <div className="p-1.5 bg-white rounded border border-slate-200 text-[10px] font-bold text-emerald-600">v{v.version}</div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-slate-700">{v.comment}</p>
                              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                                <span>{v.updatedBy}</span>
                                <span>{v.updatedAt}</span>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <p className="text-center py-4 text-xs text-slate-400 italic">No version history</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedFile.tags && (
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-800 uppercase tracking-wider text-[11px]">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFile.sharedWith && (
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-800 uppercase tracking-wider text-[11px]">Shared With</div>
                    <div className="flex items-center gap-2">
                      {selectedFile.sharedWith.map(person => (
                        <div key={person} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100">
                          <Users size={12} />
                          {person}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Workflow Modal */}
      <AnimatePresence>
        {isWorkflowModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsWorkflowModalOpen(false);
                setWorkflowDocId(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Start New Workflow</h3>
                <button 
                  onClick={() => {
                    setIsWorkflowModalOpen(false);
                    setWorkflowDocId(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Document</label>
                  <select 
                    value={workflowDocId || ''} 
                    onChange={(e) => setWorkflowDocId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="" disabled>Choose a document...</option>
                    {docs.filter(d => d.status !== 'Pending Approval' && d.type !== 'folder').map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Workflow Template</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Legal Review', 'Compliance Check', 'Executive Approval', 'Standard Review'].map(t => (
                      <button 
                        key={t}
                        onClick={() => {
                          if (workflowDocId) handleStartWorkflow(workflowDocId, t);
                        }}
                        disabled={!workflowDocId}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 text-left transition-all group disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-slate-100"
                      >
                        <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">{t}</span>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setIsWorkflowModalOpen(false);
                    setWorkflowDocId(null);
                  }}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && selectedFile && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <FileIcon type={selectedFile.type} size={20} />
                  <h3 className="font-bold text-slate-800">{selectedFile.name}</h3>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">v2.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Download size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Share2 size={18} /></button>
                  <div className="w-px h-6 bg-slate-200 mx-2" />
                  <button onClick={() => setIsPreviewOpen(false)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><X size={20} /></button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* Toolbar */}
                <div className="w-14 border-r border-slate-100 flex flex-col items-center py-4 gap-4 bg-slate-50/30">
                  <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Select"><Plus size={20} className="rotate-45" /></button>
                  <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Add Note"><FileText size={20} /></button>
                  <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Redact"><X size={20} className="border-2 border-slate-400 rounded-sm p-0.5" /></button>
                  <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Highlight"><BarChart3 size={20} className="rotate-90" /></button>
                </div>
                
                {/* Document Canvas */}
                <div className="flex-1 bg-slate-200/50 overflow-auto p-12 flex justify-center">
                  <div className="w-[800px] min-h-[1100px] bg-white shadow-xl rounded-sm p-16 relative">
                    <div className="absolute top-8 right-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Confidential</div>
                    <h1 className="text-3xl font-serif text-slate-800 mb-8 border-b-2 border-slate-100 pb-4">{selectedFile.name.split('.')[0]}</h1>
                    <div className="space-y-6">
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-5/6" />
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-4/6" />
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="pt-12 space-y-4">
                        <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 italic text-sm">
                          [ Image / Diagram Placeholder ]
                        </div>
                      </div>
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-5/6" />
                    </div>
                    {/* Mock Annotation */}
                    <div className="absolute top-[400px] right-[-40px] w-48 bg-amber-50 border border-amber-200 p-3 rounded-xl shadow-lg transform rotate-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[8px] font-bold text-amber-700">JD</div>
                        <span className="text-[9px] font-bold text-amber-800">John Doe</span>
                      </div>
                      <p className="text-[10px] text-amber-900">Please review the compliance section on page 4.</p>
                    </div>
                  </div>
                </div>
                
                {/* Side Panel */}
                <div className="w-72 border-l border-slate-100 p-6 bg-slate-50/30 overflow-y-auto">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Annotations</h4>
                  <div className="space-y-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Page 1</span>
                        <span className="text-[9px] text-slate-400">10:45 AM</span>
                      </div>
                      <p className="text-xs text-slate-700">Updated the header to reflect the new brand guidelines.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal Prototype */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <Plus size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Ingest Documents</h3>
                      <p className="text-xs text-slate-400 font-medium">Profile and classify documents for the repository.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left: File Selection & Upload */}
                  <div className="md:col-span-4 space-y-6">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group h-64">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                      </div>
                      <p className="text-slate-600 font-bold text-sm">Drag & Drop Files</p>
                      <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-wider font-bold">Bulk upload supported</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-emerald-500" />
                          <div>
                            <p className="text-xs font-bold text-slate-700">Invoice_2023.pdf</p>
                            <p className="text-[9px] text-slate-400">1.2 MB • Ready</p>
                          </div>
                        </div>
                        <X size={14} className="text-slate-300 cursor-pointer hover:text-rose-500" />
                      </div>
                    </div>
                  </div>

                  {/* Right: NetDocuments Style Profiling */}
                  <div className="md:col-span-8 space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document Profile</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Template:</span>
                        <select 
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="text-xs font-bold text-emerald-600 bg-transparent outline-none cursor-pointer"
                        >
                          <option>Legal Contract</option>
                          <option>Financial Report</option>
                          <option>Corporate Identity</option>
                          <option>General Document</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Document Title <span className="text-rose-500">*</span></label>
                        <input type="text" className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Enter title" />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Client <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none appearance-none">
                            <option value="">Select Client...</option>
                            {MOCK_CLIENTS.map(c => <option key={c}>{c}</option>)}
                          </select>
                          <Search size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Matter <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none appearance-none">
                            <option value="">Select Matter...</option>
                            {MOCK_MATTERS.map(m => <option key={m}>{m}</option>)}
                          </select>
                          <Search size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Author</label>
                        <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none">
                          <option>Me</option>
                          <option>Sarah Chen</option>
                          <option>Michael Ross</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Document Type <span className="text-rose-500">*</span></label>
                        <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none">
                          <option value="">Select Type...</option>
                          {MOCK_DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>

                      {selectedTemplate === 'Legal Contract' && (
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Practice Area</label>
                          <div className="flex flex-wrap gap-2">
                            {MOCK_PRACTICE_AREAS.map(pa => (
                              <button key={pa} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all">
                                {pa}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Comments</label>
                        <textarea className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none h-20 resize-none" placeholder="Add any internal notes..." />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="legalHold" className="rounded border-slate-300 text-emerald-600" />
                          <label htmlFor="legalHold" className="text-[10px] font-bold text-slate-600 uppercase">Legal Hold</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="official" className="rounded border-slate-300 text-emerald-600" />
                          <label htmlFor="official" className="text-[10px] font-bold text-slate-600 uppercase">Official Version</label>
                        </div>
                      </div>
                      <button 
                        onClick={handleUpload}
                        className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Profile & Ingest
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Add New User</h3>
                  <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name</label>
                    <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Email Address</label>
                    <input type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">System Role</label>
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20">
                      <option>Editor</option>
                      <option>Viewer</option>
                      <option>Admin</option>
                      <option>Compliance Officer</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => setIsUserModalOpen(false)}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                      Send Invitation
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
