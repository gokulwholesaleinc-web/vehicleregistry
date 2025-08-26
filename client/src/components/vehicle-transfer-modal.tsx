import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Share2, Shield, Clock, User, Car, CheckCircle2, XCircle, Mail } from "lucide-react";
import type { Vehicle, VehicleTransfer } from "@shared/schema";

interface VehicleTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

const transferSchema = z.object({
  toUserId: z.string().min(1, "Recipient user ID is required"),
  message: z.string().optional(),
});

type TransferForm = z.infer<typeof transferSchema>;

export default function VehicleTransferModal({ isOpen, onClose, vehicle }: VehicleTransferModalProps) {
  const [currentView, setCurrentView] = useState<"initiate" | "transfers">("transfers");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      toUserId: "",
      message: "",
    },
  });

  // Fetch all transfers for the user
  const { data: transfers = [], isLoading: transfersLoading } = useQuery<VehicleTransfer[]>({
    queryKey: ["/api/transfers"],
    enabled: isOpen,
  });

  // Initiate transfer mutation
  const initiateTransfer = useMutation({
    mutationFn: async (data: TransferForm) => {
      if (!vehicle) throw new Error("No vehicle selected");
      return apiRequest("POST", `/api/v1/vehicles/${vehicle.id}/transfer`, data);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Initiated",
        description: "Vehicle transfer request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      form.reset();
      setCurrentView("transfers");
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Accept transfer mutation
  const acceptTransfer = useMutation({
    mutationFn: async (transferId: string) => {
      return apiRequest("POST", `/api/transfers/${transferId}/accept`);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Accepted",
        description: "Vehicle ownership has been transferred successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/vehicles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Accept Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject transfer mutation
  const rejectTransfer = useMutation({
    mutationFn: async (transferId: string) => {
      return apiRequest("POST", `/api/transfers/${transferId}/reject`);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Rejected",
        description: "Vehicle transfer request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Reject Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: TransferForm) => {
    initiateTransfer.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-gray-600 border-gray-600"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Vehicle Transfer System</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Navigation */}
          <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 sm:w-48">
            <Button
              variant={currentView === "transfers" ? "default" : "outline"}
              onClick={() => setCurrentView("transfers")}
              className="flex-1 sm:flex-none sm:justify-start"
              data-testid="button-view-transfers"
            >
              <Shield className="w-4 h-4 mr-2" />
              Transfer History
            </Button>
            {vehicle && (
              <Button
                variant={currentView === "initiate" ? "default" : "outline"}
                onClick={() => setCurrentView("initiate")}
                className="flex-1 sm:flex-none sm:justify-start"
                data-testid="button-initiate-transfer"
              >
                <Share2 className="w-4 h-4 mr-2" />
                New Transfer
              </Button>
            )}
          </div>

          <Separator orientation="vertical" className="hidden sm:block h-96" />

          {/* Content */}
          <div className="flex-1">
            {currentView === "transfers" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Transfer Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage incoming and outgoing vehicle transfer requests
                  </p>
                </div>

                {transfersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading transfers...</p>
                  </div>
                ) : transfers.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No transfer requests found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Transfer requests will appear here when initiated
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {transfers.map((transfer) => (
                      <Card key={transfer.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Car className="w-4 h-4" />
                              <span className="font-medium">Transfer #{transfer.transferCode}</span>
                            </div>
                            {getStatusBadge(transfer.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <Label className="text-xs text-muted-foreground">From</Label>
                                <p className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{transfer.fromUserId}</span>
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">To</Label>
                                <p className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{transfer.toUserId}</span>
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Created</Label>
                                <p>{formatDate(transfer.createdAt)}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Expires</Label>
                                <p>{formatDate(transfer.expiresAt)}</p>
                              </div>
                            </div>
                            
                            {transfer.message && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Message</Label>
                                <p className="text-sm bg-muted p-2 rounded">{transfer.message}</p>
                              </div>
                            )}

                            {transfer.status === "pending" && (
                              <div className="flex space-x-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => acceptTransfer.mutate(transfer.id)}
                                  disabled={acceptTransfer.isPending}
                                  data-testid={`button-accept-${transfer.id}`}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rejectTransfer.mutate(transfer.id)}
                                  disabled={rejectTransfer.isPending}
                                  data-testid={`button-reject-${transfer.id}`}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentView === "initiate" && vehicle && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Transfer Vehicle</h3>
                  <p className="text-sm text-muted-foreground">
                    Transfer ownership of {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                </div>

                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Secure Transfer Process</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          The recipient will receive a transfer request with a unique code. They must accept the transfer 
                          within 7 days for the ownership change to take effect.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="toUserId">Recipient User ID</Label>
                    <Input
                      id="toUserId"
                      placeholder="Enter the recipient's user ID"
                      {...form.register("toUserId")}
                      data-testid="input-recipient-user-id"
                    />
                    {form.formState.errors.toUserId && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.toUserId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add a message for the recipient..."
                      {...form.register("message")}
                      data-testid="input-transfer-message"
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      type="submit"
                      disabled={initiateTransfer.isPending}
                      data-testid="button-submit-transfer"
                    >
                      {initiateTransfer.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 mr-2" />
                          Send Transfer Request
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentView("transfers")}
                      data-testid="button-cancel-transfer"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}