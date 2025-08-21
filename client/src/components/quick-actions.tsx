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
    <Card className="card-modern" data-testid="card-quick-actions">
      <CardHeader className="pb-3">
        <h3 className="mobile-heading text-gray-900 dark:text-white">Quick Actions</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            onClick={action.onClick}
            variant={action.variant}
            className={`w-full justify-start touch-friendly group transition-all duration-300 ${
              action.variant === "default" 
                ? "btn-primary" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
            }`}
            data-testid={action.testId}
          >
            <action.icon className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <span className="mobile-text">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
