import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Users, 
  Car, 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  UserX, 
  UserCheck, 
  Crown, 
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
  Database
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { Breadcrumb, useBreadcrumbs } from "@/components/breadcrumb";

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalVehicles: number;
  publicVehicles: number;
  totalModifications: number;
  totalMaintenanceRecords: number;
  totalTransfers: number;
  lastUpdated: string;
}

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminVehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  currentOwnerId: string;
  isPublic: boolean;
  createdAt: string;
}

interface AdminActionLog {
  id: string;
  adminUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  details?: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicle | null>(null);
  const [actionReason, setActionReason] = useState("");
  const breadcrumbs = useBreadcrumbs();

  // Check if user is admin
  if (!user || (user as any).role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Queries
  const { data: stats } = useQuery<PlatformStats>({
    queryKey: ['/api/v1/admin/stats'],
  });

  const { data: users } = useQuery<AdminUser[]>({
    queryKey: ['/api/v1/admin/users'],
  });

  const { data: vehicles } = useQuery<AdminVehicle[]>({
    queryKey: ['/api/v1/admin/vehicles'],
  });

  const { data: actionLogs } = useQuery<AdminActionLog[]>({
    queryKey: ['/api/v1/admin/action-logs'],
  });

  // Mutations
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await fetch(`/api/v1/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to suspend user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/action-logs'] });
      setSelectedUser(null);
      setActionReason("");
    }
  });

  const reactivateUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await fetch(`/api/v1/admin/users/${userId}/reactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to reactivate user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/action-logs'] });
      setSelectedUser(null);
      setActionReason("");
    }
  });

  const promoteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/v1/admin/users/${userId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to promote user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/action-logs'] });
    }
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async ({ vehicleId, reason }: { vehicleId: string; reason: string }) => {
      const response = await fetch(`/api/v1/admin/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/action-logs'] });
      setSelectedVehicle(null);
      setActionReason("");
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Platform management and moderation</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">Action Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeUsers || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                  <Car className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalVehicles || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.publicVehicles || 0} public
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Modifications</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalModifications || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Community contributions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transfers</CardTitle>
                  <Activity className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalTransfers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Vehicle ownership transfers
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>System overview and quick actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Database Status</p>
                        <p className="text-sm text-green-700">All systems operational</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">Healthy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Platform Activity</p>
                        <p className="text-sm text-blue-700">Normal user engagement</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-600 text-blue-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "destructive"}>
                            {user.isActive ? "Active" : "Suspended"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.isActive ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                    data-testid={`button-suspend-${user.id}`}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Suspend User</DialogTitle>
                                    <DialogDescription>
                                      Suspend {user.firstName} {user.lastName}? They will lose access to the platform.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Reason for suspension..."
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    data-testid="textarea-suspend-reason"
                                  />
                                  <DialogFooter>
                                    <Button
                                      variant="destructive"
                                      onClick={() => suspendUserMutation.mutate({ userId: user.id, reason: actionReason })}
                                      disabled={!actionReason.trim()}
                                      data-testid="button-confirm-suspend"
                                    >
                                      Suspend User
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                    data-testid={`button-reactivate-${user.id}`}
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reactivate User</DialogTitle>
                                    <DialogDescription>
                                      Reactivate {user.firstName} {user.lastName}? They will regain access to the platform.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Reason for reactivation..."
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    data-testid="textarea-reactivate-reason"
                                  />
                                  <DialogFooter>
                                    <Button
                                      onClick={() => reactivateUserMutation.mutate({ userId: user.id, reason: actionReason })}
                                      disabled={!actionReason.trim()}
                                      data-testid="button-confirm-reactivate"
                                    >
                                      Reactivate User
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                            
                            {user.role !== "admin" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => promoteUserMutation.mutate(user.id)}
                                data-testid={`button-promote-${user.id}`}
                              >
                                <Crown className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Management</CardTitle>
                <CardDescription>Manage platform vehicles and content</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>VIN</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles?.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                            <p className="text-sm text-gray-500">Owner: {vehicle.currentOwnerId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{vehicle.vin}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={vehicle.isPublic ? "default" : "secondary"}>
                            {vehicle.isPublic ? "Public" : "Private"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(vehicle.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedVehicle(vehicle)}
                                data-testid={`button-delete-vehicle-${vehicle.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Vehicle</DialogTitle>
                                <DialogDescription>
                                  Delete {vehicle.year} {vehicle.make} {vehicle.model}? This action cannot be undone and will remove all associated data.
                                </DialogDescription>
                              </DialogHeader>
                              <Textarea
                                placeholder="Reason for deletion..."
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                data-testid="textarea-delete-reason"
                              />
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  onClick={() => deleteVehicleMutation.mutate({ vehicleId: vehicle.id, reason: actionReason })}
                                  disabled={!actionReason.trim()}
                                  data-testid="button-confirm-delete-vehicle"
                                >
                                  Delete Vehicle
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Platform user statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Users</span>
                      <span className="font-bold text-2xl">{stats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Users</span>
                      <span className="font-bold text-2xl text-green-600">{stats?.activeUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Activity Rate</span>
                      <span className="font-bold text-2xl text-blue-600">
                        {stats?.totalUsers ? Math.round(((stats?.activeUsers || 0) / stats.totalUsers) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Statistics</CardTitle>
                  <CardDescription>Platform content overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Vehicles</span>
                      <span className="font-bold text-2xl">{stats?.totalVehicles || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Modifications</span>
                      <span className="font-bold text-2xl text-purple-600">{stats?.totalModifications || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Maintenance Records</span>
                      <span className="font-bold text-2xl text-orange-600">{stats?.totalMaintenanceRecords || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Action Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Action Logs</CardTitle>
                <CardDescription>Audit trail of administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actionLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.targetType}</p>
                            <p className="text-sm text-gray-500 font-mono">{log.targetId.slice(0, 8)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-mono">{log.adminUserId.slice(0, 8)}...</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{log.reason || "No reason provided"}</p>
                        </TableCell>
                        <TableCell>
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}