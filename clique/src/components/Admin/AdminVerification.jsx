import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Shield, User, Search, RefreshCw, CheckCircle, XCircle, FileText, Camera, Check, X, Eye } from "lucide-react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import api from '../../lib/axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function AdminVerification() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("directory");
  const [requestDecisions, setRequestDecisions] = useState({});

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      if (response.data.success) setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/admin/verifications');
      if (response.data.success) setRequests(response.data.requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleVerifyField = async (userId, fieldName, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await api.post(`/api/admin/verify/${userId}`, { [fieldName]: newStatus });
      if (response.data.success) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, profile: { ...u.profile, [fieldName]: newStatus } } : u
        ));
        toast.success(`Verification status updated`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleResolveRequest = async (requestId, action) => {
    try {
      const decision = requestDecisions[requestId] || { faceVerified: true, idVerified: true };
      const response = await api.post(`/api/admin/verifications/${requestId}/resolve`, {
        action,
        faceVerified: decision.faceVerified ?? true,
        idVerified: decision.idVerified ?? true,
      });
      if (response.data.success) {
        // remove from pending list if we're currently viewing pending
        setRequests(requests.filter(r => r.id !== requestId));
        if (action === 'approve') fetchUsers();
        toast.success(`Request ${action}ed`);
      }
    } catch (error) {
      toast.error("Failed to resolve request");
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              Admin Panel
            </h1>
            <p className="text-slate-600">Verification & User Management</p>
          </div>
          <Button onClick={loadAll} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="directory" className="w-full">
          <TabsList className="bg-white border border-slate-200 mb-6 p-1">
            <TabsTrigger value="directory" className="px-6">User Directory</TabsTrigger>
            <TabsTrigger value="requests" className="px-6 relative">
              Pending Requests
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-slate-50">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>User Directory</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search users..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Face Verified</TableHead>
                        <TableHead>College Verified</TableHead>
                        <TableHead>Work Verified</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Loading...</TableCell></TableRow>
                      ) : filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="font-semibold text-slate-800">{user.fullName}</div>
                            {user.profile?.college && <div className="text-xs text-slate-500">🎓 {user.profile.college}</div>}
                            {user.profile?.work && <div className="text-xs text-slate-500">💼 {user.profile.work}</div>}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">{user.email}</TableCell>
                          
                          {/* Face Verification */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={user.profile?.isPersonVerified || false}
                                onCheckedChange={() => handleToggleVerifyField(user.id, 'isPersonVerified', user.profile?.isPersonVerified)}
                                disabled={!user.profile}
                              />
                              {user.profile?.isPersonVerified ? (
                                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Verified</span>
                              ) : (
                                <span className="text-xs text-slate-400">Unverified</span>
                              )}
                            </div>
                          </TableCell>

                          {/* College Verification */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={user.profile?.isCollegeVerified || false}
                                onCheckedChange={() => handleToggleVerifyField(user.id, 'isCollegeVerified', user.profile?.isCollegeVerified)}
                                disabled={!user.profile || !user.profile.college}
                              />
                              {user.profile?.isCollegeVerified ? (
                                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Verified</span>
                              ) : (
                                <span className="text-xs text-slate-400">Unverified</span>
                              )}
                            </div>
                          </TableCell>

                          {/* Work Verification */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={user.profile?.isWorkVerified || false}
                                onCheckedChange={() => handleToggleVerifyField(user.id, 'isWorkVerified', user.profile?.isWorkVerified)}
                                disabled={!user.profile || !user.profile.work}
                              />
                              {user.profile?.isWorkVerified ? (
                                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Verified</span>
                              ) : (
                                <span className="text-xs text-slate-400">Unverified</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.length === 0 ? (
                <Card className="col-span-full py-20 text-center text-slate-400 border-dashed">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No pending verification requests</p>
                </Card>
              ) : requests.map((req) => (
                <Card key={req.id} className="overflow-hidden border-slate-200 shadow-md">
                  <div className="bg-slate-50 p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900">{req.fullName}</h3>
                    <p className="text-xs text-slate-500">{req.email}</p>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        {req.verificationMethod === "email" ? "Email proof" : "ID document"}
                      </label>
                      {req.idCardUrl ? (
                        <div className="aspect-[16/10] bg-black rounded-lg overflow-hidden group relative">
                          <img src={req.idCardUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="ID Card" />
                          <a href={req.idCardUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="text-white w-6 h-6" />
                          </a>
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-slate-100 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-4 text-center text-sm text-slate-600">
                          <FileText className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="font-medium text-slate-800">Verified by email</p>
                          <p className="text-xs text-slate-500 break-all mt-1">{req.affiliationEmail || "—"}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Verification Selfie</label>
                      <div className="aspect-square bg-black rounded-lg overflow-hidden group relative">
                        <img src={req.selfieUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Selfie" />
                        <a href={req.selfieUrl} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="text-white w-6 h-6" />
                        </a>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <Checkbox
                          checked={(requestDecisions[req.id]?.faceVerified) ?? true}
                          onCheckedChange={(v) =>
                            setRequestDecisions((prev) => ({
                              ...prev,
                              [req.id]: { ...(prev[req.id] || {}), faceVerified: !!v },
                            }))
                          }
                        />
                        Face verified
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <Checkbox
                          checked={(requestDecisions[req.id]?.idVerified) ?? true}
                          onCheckedChange={(v) =>
                            setRequestDecisions((prev) => ({
                              ...prev,
                              [req.id]: { ...(prev[req.id] || {}), idVerified: !!v },
                            }))
                          }
                        />
                        {req.verificationMethod === "email" ? "Email proof OK" : "ID verified"}
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleResolveRequest(req.id, 'approve')}
                        className="flex-1 bg-green-600 hover:bg-green-700 h-11"
                      >
                        <Check className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button 
                        onClick={() => handleResolveRequest(req.id, 'reject')}
                        variant="outline" 
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-11"
                      >
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
