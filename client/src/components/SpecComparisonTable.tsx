import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowDown, RotateCcw } from "lucide-react";

interface Spec {
  id: string;
  title: string;
  wheels?: string;
  tires?: string;
  suspension?: string;
  power?: string;
  brakes?: string;
  aero?: string;
  weight?: string;
  notes?: string;
  isStockBaseline: boolean;
  createdAt: string;
}

interface SpecComparisonTableProps {
  specs: Spec[];
  className?: string;
}

export function SpecComparisonTable({ specs, className }: SpecComparisonTableProps) {
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');

  const specCategories = [
    { key: 'wheels', label: 'Wheels' },
    { key: 'tires', label: 'Tires' },
    { key: 'suspension', label: 'Suspension' },
    { key: 'power', label: 'Power' },
    { key: 'brakes', label: 'Brakes' },
    { key: 'aero', label: 'Aero' },
    { key: 'weight', label: 'Weight' },
  ];

  const toggleSpecSelection = (specId: string) => {
    setSelectedSpecs(prev => {
      if (prev.includes(specId)) {
        return prev.filter(id => id !== specId);
      } else if (prev.length < 3) {
        return [...prev, specId];
      } else {
        return [prev[1], prev[2], specId]; // Keep last 2 and add new one
      }
    });
  };

  const compareSpecs = specs.filter(spec => selectedSpecs.includes(spec.id));

  if (specs.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No specifications available to compare</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle data-testid="text-comparison-title">Build Specifications</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal')}
                data-testid="button-toggle-layout"
              >
                {layout === 'horizontal' ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSpecs([])}
                disabled={selectedSpecs.length === 0}
                data-testid="button-clear-selection"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="select" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Select Builds</TabsTrigger>
              <TabsTrigger value="compare" disabled={selectedSpecs.length < 2}>
                Compare ({selectedSpecs.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="select" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select up to 3 build specifications to compare side by side
              </p>
              
              <div className="grid gap-4">
                {specs.map((spec) => (
                  <Card 
                    key={spec.id}
                    className={`cursor-pointer transition-colors ${
                      selectedSpecs.includes(spec.id) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleSpecSelection(spec.id)}
                    data-testid={`card-spec-${spec.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {spec.title}
                            {spec.isStockBaseline && (
                              <Badge variant="outline" className="text-xs">
                                Stock
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(spec.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {selectedSpecs.includes(spec.id) && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="compare" className="space-y-4">
              {compareSpecs.length >= 2 && (
                <div className={`grid gap-4 ${
                  layout === 'horizontal' 
                    ? `grid-cols-${Math.min(compareSpecs.length, 3)}` 
                    : 'grid-cols-1'
                }`}>
                  {layout === 'horizontal' ? (
                    <>
                      {/* Column headers */}
                      {compareSpecs.map((spec) => (
                        <div key={`header-${spec.id}`} className="font-medium text-center p-2 border-b">
                          <div data-testid={`text-spec-title-${spec.id}`}>
                            {spec.title}
                            {spec.isStockBaseline && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Stock
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Comparison rows */}
                      {specCategories.map((category) => (
                        <React.Fragment key={category.key}>
                          {compareSpecs.map((spec, index) => (
                            <div key={`${category.key}-${spec.id}`} className="p-2 border-b">
                              {index === 0 && (
                                <div className="font-medium text-sm text-muted-foreground mb-1">
                                  {category.label}
                                </div>
                              )}
                              <div className="text-sm" data-testid={`text-${category.key}-${spec.id}`}>
                                {(spec as any)[category.key] || '-'}
                              </div>
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                      
                      {/* Notes row */}
                      {compareSpecs.map((spec, index) => (
                        <div key={`notes-${spec.id}`} className="p-2">
                          {index === 0 && (
                            <div className="font-medium text-sm text-muted-foreground mb-1">
                              Notes
                            </div>
                          )}
                          <div className="text-sm" data-testid={`text-notes-${spec.id}`}>
                            {spec.notes || '-'}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    /* Vertical layout */
                    compareSpecs.map((spec) => (
                      <Card key={spec.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {spec.title}
                            {spec.isStockBaseline && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Stock
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {specCategories.map((category) => (
                            <div key={category.key} className="flex justify-between">
                              <span className="font-medium text-sm">{category.label}:</span>
                              <span className="text-sm" data-testid={`text-${category.key}-${spec.id}`}>
                                {(spec as any)[category.key] || '-'}
                              </span>
                            </div>
                          ))}
                          {spec.notes && (
                            <div className="pt-2 border-t">
                              <span className="font-medium text-sm">Notes:</span>
                              <p className="text-sm mt-1" data-testid={`text-notes-${spec.id}`}>
                                {spec.notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}