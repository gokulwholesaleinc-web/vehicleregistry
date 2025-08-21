import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Receipt, Wrench, Plus } from "lucide-react";

interface QuickActionsProps {
  onAddEntry: (type: "modification" | "maintenance") => void;
}

export default function QuickActions({ onAddEntry }: QuickActionsProps) {
  const actions = [
    {
      label: "Add Photos",
      icon: Camera,
      variant: "default" as const,
      onClick: () => onAddEntry("modification"),
      testId: "button-add-photos"
    },
    {
      label: "Upload Invoice",
      icon: Receipt,
      variant: "secondary" as const,
      onClick: () => onAddEntry("modification"),
      testId: "button-upload-invoice"
    },
    {
      label: "Log Maintenance",
      icon: Wrench,
      variant: "secondary" as const,
      onClick: () => onAddEntry("maintenance"),
      testId: "button-log-maintenance"
    },
    {
      label: "New Modification",
      icon: Plus,
      variant: "secondary" as const,
      onClick: () => onAddEntry("modification"),
      testId: "button-new-modification"
    },
  ];

  return (
    <Card data-testid="card-quick-actions">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              onClick={action.onClick}
              variant={action.variant}
              className={`w-full justify-start ${
                action.variant === "default" 
                  ? "bg-automotive-blue-600 text-white hover:bg-automotive-blue-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              data-testid={action.testId}
            >
              <action.icon className="h-4 w-4 mr-3" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
