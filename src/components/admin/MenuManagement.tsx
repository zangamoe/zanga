import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus, GripVertical, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface MenuItem {
  id: string;
  label: string;
  path: string;
  order_index: number;
  enabled: boolean;
}

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ label: "", path: "" });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("order_index");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading menu items",
        description: error.message,
      });
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newItem.label || !newItem.path) {
      toast({
        variant: "destructive",
        title: "Please fill in all fields",
      });
      return;
    }

    const { error } = await supabase
      .from("menu_items")
      .insert({
        label: newItem.label,
        path: newItem.path,
        order_index: menuItems.length,
        enabled: true,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error adding menu item",
        description: error.message,
      });
    } else {
      toast({ title: "Menu item added" });
      setNewItem({ label: "", path: "" });
      fetchMenuItems();
    }
  };

  const handleUpdate = async (id: string, updates: Partial<MenuItem>) => {
    const { error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating menu item",
        description: error.message,
      });
    } else {
      fetchMenuItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting menu item",
        description: error.message,
      });
    } else {
      toast({ title: "Menu item deleted" });
      fetchMenuItems();
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Add New Menu Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Label</Label>
              <Input
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                placeholder="e.g., Home"
              />
            </div>
            <div>
              <Label>Path</Label>
              <Input
                value={newItem.path}
                onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                placeholder="e.g., /"
              />
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Menu Items</h3>
        {menuItems.map((item) => (
          <Card key={item.id} className={`bg-gradient-card border-border/50 ${!item.enabled ? 'opacity-60' : ''}`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <Input
                    value={item.label}
                    onChange={(e) => handleUpdate(item.id, { label: e.target.value })}
                    placeholder="Label"
                  />
                  <Input
                    value={item.path}
                    onChange={(e) => handleUpdate(item.id, { path: e.target.value })}
                    placeholder="Path"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.enabled}
                    onCheckedChange={(checked) => handleUpdate(item.id, { enabled: checked })}
                  />
                  {item.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;
