import { useEffect, useState } from 'react';
import { PageContainer, PageHeader } from '@/components/Page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Save, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE = '/showcase';

type ShowcaseItem = {
  id: string;
  title: string;
  description?: string;
  photoUrl: string;
  credit?: string;
  isActive: boolean;
  sortIndex: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export default function ShowcaseManager() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    photoUrl: '',
    credit: '',
    sortIndex: 0,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const response = await fetch(`${API_BASE}/admin`, {
        credentials: 'include',
      });
      if (response.ok) {
        const result = await response.json();
        setItems(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load showcase items:', error);
    }
  }

  async function createItem() {
    if (!draft.title.trim() || !draft.photoUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and photo URL are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(draft),
      });

      if (response.ok) {
        await loadItems();
        setDraft({
          title: '',
          description: '',
          photoUrl: '',
          credit: '',
          sortIndex: 0,
          isActive: true
        });
        toast({
          title: "Success",
          description: "Showcase item created successfully",
        });
      } else {
        throw new Error('Failed to create item');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create showcase item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateItem(id: string, data: Partial<ShowcaseItem>) {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadItems();
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        throw new Error('Failed to update item');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update showcase item",
        variant: "destructive",
      });
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Are you sure you want to delete this showcase item?')) return;

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await loadItems();
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete showcase item",
        variant: "destructive",
      });
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Showcase Manager"
        subtitle="Manage community showcase images and descriptions"
      />

      {/* Create New Item Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Showcase Item
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Item title"
                data-testid="input-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Photo URL *</label>
              <Input
                value={draft.photoUrl}
                onChange={(e) => setDraft(prev => ({ ...prev, photoUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                data-testid="input-photo-url"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={draft.description}
              onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={3}
              data-testid="input-description"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Credit</label>
              <Input
                value={draft.credit}
                onChange={(e) => setDraft(prev => ({ ...prev, credit: e.target.value }))}
                placeholder="Photo credit"
                data-testid="input-credit"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sort Index</label>
              <Input
                type="number"
                value={draft.sortIndex}
                onChange={(e) => setDraft(prev => ({ ...prev, sortIndex: parseInt(e.target.value) || 0 }))}
                data-testid="input-sort-index"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={draft.isActive}
                onCheckedChange={(checked) => setDraft(prev => ({ ...prev, isActive: checked }))}
                data-testid="switch-is-active"
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>
          
          <Button onClick={createItem} disabled={loading} data-testid="button-create-item">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Item'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className={`${!item.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={item.photoUrl}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                    data-testid={`img-showcase-${item.id}`}
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg" data-testid={`text-title-${item.id}`}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-500">#{item.sortIndex}</span>
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={(checked) => updateItem(item.id, { isActive: checked })}
                        data-testid={`switch-active-${item.id}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {item.description}
                    </p>
                  )}
                  
                  {item.credit && (
                    <p className="text-xs text-slate-500">
                      Credit: {item.credit}
                    </p>
                  )}
                  
                  <div className="text-xs text-slate-400">
                    Created: {new Date(item.createdAt).toLocaleString()}
                    {item.updatedAt !== item.createdAt && (
                      <> • Updated: {new Date(item.updatedAt).toLocaleString()}</>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No showcase items yet. Create your first one above!</p>
        </div>
      )}
    </PageContainer>
  );
}