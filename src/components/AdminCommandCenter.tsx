import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  List, 
  Power, 
  Plus, 
  Trash2, 
  Clock, 
  Globe, 
  Activity,
  AlertTriangle,
  Server,
  Lock as LockIcon
} from 'lucide-react';
import { WhitelistedIP, AccessLog, UserAccount } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AdminCommandCenterProps {
  ips: WhitelistedIP[];
  logs: AccessLog[];
  onAddIP: (ip: string, name: string) => void;
  onRemoveIP: (id: string) => void;
  onToggleKillSwitch: () => void;
  isKillSwitchActive: boolean;
  users: UserAccount[];
  onAddUser: (username: string, token: string) => void;
  onRemoveUser: (id: string) => void;
}

export const AdminCommandCenter = ({ 
  ips, 
  logs, 
  onAddIP, 
  onRemoveIP, 
  onToggleKillSwitch, 
  isKillSwitchActive,
  users,
  onAddUser,
  onRemoveUser
}: AdminCommandCenterProps) => {
  const [newIP, setNewIP] = useState('');
  const [newName, setNewName] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newToken, setNewToken] = useState('');
  const [activeTab, setActiveTab] = useState<'ips' | 'logs' | 'users' | 'system'>('users');

  const handleSubmitIP = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIP && newName) {
      onAddIP(newIP, newName);
      setNewIP('');
      setNewName('');
    }
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser && newToken) {
      onAddUser(newUser, newToken);
      setNewUser('');
      setNewToken('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="text-emerald-500" /> Command Center <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded uppercase tracking-[0.2em] ml-2">Elevated Privileges</span>
          </h2>
          <p className="text-zinc-500 text-xs font-mono mt-1">Operational Control & Perimeter Management</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleKillSwitch}
            className={cn(
              "px-6 py-2.5 rounded-lg border font-mono text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all",
              isKillSwitchActive 
                ? "bg-red-500 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-red-500/50 hover:text-red-400"
            )}
          >
            <Power size={14} /> {isKillSwitchActive ? "Emergency: System Locked" : "Initiate Kill Switch"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800/50">
        {[
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'ips', label: 'Access Manager', icon: Globe },
          { id: 'logs', label: 'Request Logs', icon: List },
          { id: 'system', label: 'System Health', icon: Activity }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-3 text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 border-b-2 transition-all",
              activeTab === tab.id 
                ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" 
                : "border-transparent text-zinc-600 hover:text-zinc-400"
            )}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <form onSubmit={handleSubmitUser} className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 space-y-4">
                  <h4 className="text-[10px] font-mono uppercase text-zinc-500 mb-4 flex items-center gap-2">
                    <Plus size={12} /> Register New Account
                  </h4>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Username..." 
                      value={newUser}
                      onChange={(e) => setNewUser(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 focus:border-emerald-500/50 outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Security Token..." 
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 focus:border-emerald-500/50 outline-none"
                    />
                    <button className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded text-[10px] font-mono hover:bg-emerald-500 hover:text-black transition-all">
                      PROVISION_USER
                    </button>
                  </div>
                </form>
              </div>

              <div className="md:col-span-2">
                <div className="border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-[#0a0a0a] text-[9px] font-mono uppercase tracking-[0.1em] text-zinc-600">
                      <tr>
                        <th className="px-6 py-4">Identity</th>
                        <th className="px-6 py-4">Auth Key</th>
                        <th className="px-6 py-4">Linked IP</th>
                        <th className="px-6 py-4">Created</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {users.length > 0 ? users.map(user => (
                        <tr key={user.id} className="text-xs group hover:bg-zinc-900/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-zinc-300">{user.username}</td>
                          <td className="px-6 py-4 font-mono text-emerald-500/80 underline decoration-emerald-500/10 underline-offset-4">{user.token}</td>
                          <td className="px-6 py-4 font-mono text-zinc-500">
                            {user.linkedIP || <span className="text-zinc-700 italic">Not Anchored</span>}
                          </td>
                          <td className="px-6 py-4 font-mono text-zinc-600 font-light">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => onRemoveUser(user.id)}
                              className="text-zinc-700 hover:text-red-500 transition-colors"
                              title="Decommission User"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-zinc-700 font-mono text-[10px] uppercase">
                            No secondary users provisioned.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'ips' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <form onSubmit={handleSubmitIP} className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 space-y-4">
                  <h4 className="text-[10px] font-mono uppercase text-zinc-500 mb-4 flex items-center gap-2">
                    <Plus size={12} /> Add New Authorized IP
                  </h4>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="IP Address..." 
                      value={newIP}
                      onChange={(e) => setNewIP(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 focus:border-emerald-500/50 outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Operator Name..." 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 focus:border-emerald-500/50 outline-none"
                    />
                    <button className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded text-[10px] font-mono hover:bg-emerald-500 hover:text-black transition-all">
                      AUTHORIZE_ENDPOINT
                    </button>
                  </div>
                </form>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                  <p className="text-[10px] font-mono text-amber-500/80 leading-relaxed uppercase">
                    Unauthorized IPs will be automatically redirected to a 404 void.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="border border-zinc-800/50 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-900/50 text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                      <tr>
                        <th className="px-6 py-4">Operator</th>
                        <th className="px-6 py-4">IP Address</th>
                        <th className="px-6 py-4">Authorized At</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {ips.map(ip => (
                        <tr key={ip.id} className="text-xs group hover:bg-zinc-900/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-zinc-300">{ip.name}</td>
                          <td className="px-6 py-4 font-mono text-zinc-500">{ip.ip}</td>
                          <td className="px-6 py-4 font-mono text-zinc-600 font-light">{new Date(ip.addedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => onRemoveIP(ip.id)}
                              className="text-zinc-700 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/10">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0d0d0d] sticky top-0 text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Identity</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50 text-[11px] font-mono">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-zinc-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="px-6 py-4 text-zinc-300">{log.ip}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-[2px] text-[9px] uppercase",
                          log.level === 'admin' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{log.action}</td>
                      <td className="px-6 py-4 text-zinc-600 truncate max-w-[200px]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SystemMetric label="API Uplink" value="99.9%" icon={Globe} color="emerald" />
            <SystemMetric label="Active Sessions" value={ips.length.toString()} icon={Users} color="blue" />
            <SystemMetric label="Total Requests" value={logs.length.toString()} icon={Server} color="amber" />
            <SystemMetric label="Security Layer" value="V3.3 Elite" icon={Shield} color="zinc" />
            
            <div className="md:col-span-4 bg-[#121212] border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative">
                <AnimatePresence mode="wait">
                  {isKillSwitchActive ? (
                    <motion.div key="locked" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <LockIcon className="text-red-500" size={64} />
                    </motion.div>
                  ) : (
                    <motion.div key="unlocked" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <Power className="text-emerald-500 animate-pulse" size={64} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-mono font-bold uppercase tracking-widest text-white">System Status: {isKillSwitchActive ? "LOCKED" : "OPERATIONAL"}</h3>
                <p className="text-xs font-mono text-zinc-500 max-w-md">
                  {isKillSwitchActive 
                    ? "Global Lockdown sequence active. All modules are currently disabled." 
                    : "The system is functioning normally under supervised management."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SystemMetric = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-xl space-y-3">
    <div className={cn(
      "w-10 h-10 rounded-lg flex items-center justify-center",
      color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
      color === 'blue' ? "bg-blue-500/10 text-blue-500" :
      color === 'amber' ? "bg-amber-500/10 text-amber-500" : "bg-zinc-800 text-zinc-400"
    )}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold text-white font-mono mt-1">{value}</p>
    </div>
  </div>
);
