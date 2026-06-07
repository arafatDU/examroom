"use client";

import { useEffect, useState, useMemo } from "react";
import { UserPlus, Search, Shield, User as UserIcon, GraduationCap, X, Trash2, Edit2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TEACHER"
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = editingUser ? `/api/admin/users/${editingUser._id}` : "/api/auth/register";
    const method = editingUser ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "TEACHER" });
      fetchUsers();
    } else {
      alert("Failed to save user");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      alert("An error occurred while deleting the user");
    }
  };

  // Client side search matching name, email, or role
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u: any) => {
      const name = u.name?.toLowerCase() || "";
      const email = u.email?.toLowerCase() || "";
      const role = u.role?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query) || role.includes(query);
    });
  }, [users, searchQuery]);

  const getRoleIconAndBadge = (role: string) => {
    switch (role) {
      case "ADMIN": 
        return {
          icon: <Shield className="w-3.5 h-3.5" />,
          classes: "bg-purple-50 text-purple-700 border border-purple-100"
        };
      case "TEACHER": 
        return {
          icon: <UserIcon className="w-3.5 h-3.5" />,
          classes: "bg-blue-50 text-blue-700 border border-blue-100"
        };
      case "STUDENT": 
        return {
          icon: <GraduationCap className="w-3.5 h-3.5" />,
          classes: "bg-emerald-50 text-emerald-700 border border-emerald-100"
        };
      default: 
        return {
          icon: <UserIcon className="w-3.5 h-3.5" />,
          classes: "bg-slate-50 text-slate-700 border border-slate-100"
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">User Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Invite teachers, view active students, and manage platform roles.</p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: "", email: "", password: "", role: "TEACHER" });
            setShowModal(true);
          }}
          className="btn-primary px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          Create Teacher
        </button>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-800">{editingUser ? "Edit Profile Settings" : "Add New Teacher"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              {!editingUser && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      className="input-field"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      className="input-field"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Role</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              
              <div className="pt-2">
                <button className="w-full btn-primary py-3 rounded-xl font-bold text-xs">
                  {editingUser ? "Save Profile Details" : "Register User Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table list container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800 text-base">All Registered Users</h2>
            <p className="text-slate-400 text-xs mt-0.5">Search or edit user profile access parameters.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Search by name, email, or role..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors" 
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role Access</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                      <span>Fetching user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400 text-sm">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleMeta = getRoleIconAndBadge(user.role);
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                          roleMeta.classes
                        )}>
                          {roleMeta.icon}
                          <span>{user.role}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button 
                          onClick={() => {
                            setEditingUser(user);
                            setFormData({ name: user.name, email: user.email, password: "", role: user.role });
                            setShowModal(true);
                          }}
                          className="inline-flex p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="inline-flex p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
