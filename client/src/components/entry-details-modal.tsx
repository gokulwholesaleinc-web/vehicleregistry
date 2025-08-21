import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, MapPin, Wrench, Settings, FileText, Camera, Edit3, Trash2 } from "lucide-react";
import { useState } from "react";

interface EntryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  entryType: "modification" | "maintenance";
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function EntryDetailsModal({ 
  isOpen, 
  onClose, 
  entry, 
  entryType,
  onEdit,
  onDelete 
}: EntryDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details");

  if (!entry) return null;

  const isModification = entryType === "modification";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="modal-entry-details">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="mobile-heading">
              {isModification ? entry.title : entry.serviceType}
            </DialogTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className={isModification ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"}>
                {isModification ? entry.category : "Maintenance"}
              </Badge>
              <Badge variant="outline" className="font-medium">
                ${parseFloat(entry.cost || "0").toFixed(2)}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="interactive-scale"
                data-testid="button-edit-entry"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="interactive-scale text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                data-testid="button-delete-entry"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-modern">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium">
                        {new Date(isModification ? entry.installDate : entry.serviceDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Mileage</p>
                      <p className="font-medium">{entry.mileage?.toLocaleString() || 'N/A'} miles</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cost</p>
                      <p className="font-medium text-lg">${parseFloat(entry.cost || "0").toFixed(2)}</p>
                    </div>
                  </div>
                  {!isModification && entry.shop && (
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Service Location</p>
                        <p className="font-medium">{entry.shop}</p>
                      </div>
                    </div>
                  )}
                  {isModification && entry.status && (
                    <div className="flex items-center space-x-3">
                      <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <Badge variant={entry.status === 'installed' ? 'default' : 'secondary'} className="mt-1">
                          {entry.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
                      <p className="text-sm leading-relaxed">
                        {entry.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isModification && (
              <Card className="card-modern">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Installation Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium">{entry.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Install Date</p>
                      <p className="font-medium">{new Date(entry.installDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Status</p>
                      <Badge variant={entry.status === 'installed' ? 'default' : 'secondary'} className="text-xs">
                        {entry.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="text-center py-8">
              <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">File management coming soon</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                View and manage photos and documents for this entry
              </p>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Entry Created</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(entry.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">
                    {isModification ? 'Modification Installed' : 'Service Completed'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(isModification ? entry.installDate : entry.serviceDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}