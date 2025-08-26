import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Calendar,
  Globe,
  Lock,
  QrCode
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PublicShare {
  id: string;
  vehicleId: string;
  userId: string;
  token: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface PublicVehicleShareProps {
  vehicleId: string;
}

export default function PublicVehicleShare({ vehicleId }: PublicVehicleShareProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expiryDays, setExpiryDays] = useState<string>("30");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch existing shares for this vehicle
  const { data: sharesResponse, isLoading } = useQuery({
    queryKey: ['/api/v1/shares', vehicleId],
    queryFn: () => apiRequest('GET', `/api/v1/shares/${vehicleId}`),
  });

  const shares = sharesResponse?.data?.data || [];
  const activeShare = shares.find((share: PublicShare) => share.isActive);

  // Create share mutation
  const createShareMutation = useMutation({
    mutationFn: (expiryDays?: number) => {
      const payload: any = {};
      if (expiryDays && expiryDays > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);
        payload.expiresAt = expiresAt.toISOString();
      }
      return apiRequest('POST', `/api/v1/shares/${vehicleId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/shares', vehicleId] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Share Link Created",
        description: "Public share link has been generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create share link",
        variant: "destructive",
      });
    },
  });

  // Toggle share status mutation
  const toggleShareMutation = useMutation({
    mutationFn: ({ shareId, isActive }: { shareId: string; isActive: boolean }) =>
      apiRequest('PATCH', `/api/v1/shares/${shareId}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/shares', vehicleId] });
      toast({
        title: "Share Updated",
        description: "Share link status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update share",
        variant: "destructive",
      });
    },
  });

  // Delete share mutation
  const deleteShareMutation = useMutation({
    mutationFn: (shareId: string) => apiRequest('DELETE', `/api/v1/shares/${shareId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/shares', vehicleId] });
      toast({
        title: "Share Deleted",
        description: "Share link has been permanently removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete share",
        variant: "destructive",
      });
    },
  });

  const handleCreateShare = () => {
    const days = parseInt(expiryDays);
    createShareMutation.mutate(days > 0 ? days : undefined);
  };

  const handleCopyLink = (token: string) => {
    const shareUrl = `${window.location.origin}/public/vehicle/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to your clipboard.",
    });
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/public/vehicle/${token}`;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Public Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading share settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="public-vehicle-share">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Public Sharing
            </CardTitle>
            <CardDescription>
              Generate shareable links for your vehicle showcase
            </CardDescription>
          </div>
          {!activeShare && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-share">
                  <Share2 className="h-4 w-4 mr-2" />
                  Create Share Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Public Share Link</DialogTitle>
                  <DialogDescription>
                    Generate a public link that allows others to view your vehicle showcase.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Link Expiry (days)</Label>
                    <Input
                      id="expiry"
                      type="number"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                      placeholder="30"
                      min="0"
                      data-testid="input-expiry-days"
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave as 0 for no expiration, or set a number of days after which the link will become inactive.
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateShare}
                    disabled={createShareMutation.isPending}
                    data-testid="button-confirm-create-share"
                  >
                    {createShareMutation.isPending ? "Creating..." : "Create Link"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {shares.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No public shares</h3>
            <p className="text-muted-foreground mb-4">
              Create a shareable link to showcase your vehicle publicly.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-share">
              <Share2 className="h-4 w-4 mr-2" />
              Create Your First Share Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {shares.map((share: PublicShare) => (
              <Card key={share.id} className={`transition-colors ${!share.isActive || isExpired(share.expiresAt) ? 'opacity-60' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={share.isActive && !isExpired(share.expiresAt) ? "default" : "secondary"}>
                          {share.isActive ? (isExpired(share.expiresAt) ? "Expired" : "Active") : "Inactive"}
                        </Badge>
                        {share.expiresAt && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Expires {new Date(share.expiresAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Share URL:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            readOnly
                            value={getShareUrl(share.token)}
                            className="font-mono text-sm"
                            data-testid={`input-share-url-${share.id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(share.token)}
                            data-testid={`button-copy-${share.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getShareUrl(share.token), '_blank')}
                            disabled={!share.isActive || isExpired(share.expiresAt)}
                            data-testid={`button-visit-${share.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Created on {new Date(share.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`active-${share.id}`} className="text-sm">
                          {share.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Label>
                        <Switch
                          id={`active-${share.id}`}
                          checked={share.isActive}
                          onCheckedChange={(checked) =>
                            toggleShareMutation.mutate({ shareId: share.id, isActive: checked })
                          }
                          disabled={toggleShareMutation.isPending || isExpired(share.expiresAt)}
                          data-testid={`switch-active-${share.id}`}
                        />
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteShareMutation.mutate(share.id)}
                        disabled={deleteShareMutation.isPending}
                        data-testid={`button-delete-${share.id}`}
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {activeShare && (
          <div className="mt-6">
            <Separator className="mb-4" />
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Sharing Information
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Anyone with the link can view your vehicle showcase</li>
                <li>• Visitors can see photos, modifications, and public information</li>
                <li>• Personal details and maintenance records remain private</li>
                <li>• You can disable or delete the link at any time</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}