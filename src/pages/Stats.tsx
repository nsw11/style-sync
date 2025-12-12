import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Camera,
  Shirt as ShirtIcon,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useClothingStore } from '@/hooks/useClothingStore';
import { useOutfitStore } from '@/hooks/useOutfitStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Category, CATEGORIES, ClothingItem, Outfit, StatsSortOption } from '@/types/clothing';
import { format, subDays, isAfter } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = [
  'hsl(152, 40%, 50%)',
  'hsl(200, 70%, 55%)',
  'hsl(45, 85%, 55%)',
  'hsl(350, 65%, 55%)',
  'hsl(280, 50%, 55%)',
  'hsl(30, 60%, 50%)',
  'hsl(170, 50%, 45%)',
  'hsl(320, 55%, 55%)',
];

const Stats = () => {
  const { items, logWear } = useClothingStore();
  const { outfits, logOutfitWear } = useOutfitStore();
  const { toast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortOption, setSortOption] = useState<StatsSortOption>('mostWorn');
  const [showLogWearDialog, setShowLogWearDialog] = useState(false);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [wearPhoto, setWearPhoto] = useState<string>('');

  // Get the selected outfit from outfits based on ID
  const selectedOutfit = selectedOutfitId ? outfits.find(o => o.id === selectedOutfitId) : null;

  // Calculate item stats
  const itemStats = useMemo(() => {
    let filtered = [...items];
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Calculate cost per wear
    const withCostPerWear = filtered.map(item => ({
      ...item,
      costPerWear: item.cost && item.wearCount > 0 ? item.cost / item.wearCount : null,
    }));

    // Sort based on option
    switch (sortOption) {
      case 'mostWorn':
        withCostPerWear.sort((a, b) => b.wearCount - a.wearCount);
        break;
      case 'leastWorn':
        withCostPerWear.sort((a, b) => a.wearCount - b.wearCount);
        break;
      case 'bestValue':
        withCostPerWear.sort((a, b) => {
          if (!a.costPerWear) return 1;
          if (!b.costPerWear) return -1;
          return a.costPerWear - b.costPerWear;
        });
        break;
      case 'worstValue':
        withCostPerWear.sort((a, b) => {
          if (!a.costPerWear) return 1;
          if (!b.costPerWear) return -1;
          return b.costPerWear - a.costPerWear;
        });
        break;
      case 'recent':
        withCostPerWear.sort((a, b) => {
          const aLatest = a.wearLogs?.length ? new Date(a.wearLogs[a.wearLogs.length - 1].date).getTime() : 0;
          const bLatest = b.wearLogs?.length ? new Date(b.wearLogs[b.wearLogs.length - 1].date).getTime() : 0;
          return bLatest - aLatest;
        });
        break;
    }

    return withCostPerWear;
  }, [items, categoryFilter, sortOption]);

  // Category breakdown for chart
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return CATEGORIES.map((cat, i) => ({
      name: cat,
      value: counts[cat] || 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })).filter(d => d.value > 0);
  }, [items]);

  // Wear frequency over last 30 days
  const wearFrequencyData = useMemo(() => {
    const last30Days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'MMM d');
      last30Days[date] = 0;
    }

    items.forEach(item => {
      (item.wearLogs || []).forEach(log => {
        const logDate = new Date(log.date);
        if (isAfter(logDate, subDays(new Date(), 30))) {
          const dateKey = format(logDate, 'MMM d');
          if (last30Days[dateKey] !== undefined) {
            last30Days[dateKey]++;
          }
        }
      });
    });

    return Object.entries(last30Days).map(([date, count]) => ({ date, count }));
  }, [items]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalItems = items.length;
    const totalWears = items.reduce((sum, item) => sum + item.wearCount, 0);
    const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);
    const itemsWithCost = items.filter(item => item.cost && item.wearCount > 0);
    const avgCostPerWear = itemsWithCost.length > 0
      ? itemsWithCost.reduce((sum, item) => sum + (item.cost! / item.wearCount), 0) / itemsWithCost.length
      : 0;
    const neverWorn = items.filter(item => item.wearCount === 0).length;

    return { totalItems, totalWears, totalCost, avgCostPerWear, neverWorn };
  }, [items]);

  // Outfit stats
  const outfitStats = useMemo(() => {
    return outfits.map(outfit => {
      const outfitItems = Object.values(outfit.items)
        .filter(Boolean)
        .map(id => items.find(item => item.id === id))
        .filter(Boolean) as ClothingItem[];
      
      const totalCost = outfitItems.reduce((sum, item) => sum + (item.cost || 0), 0);
      const costPerWear = outfit.wearCount > 0 ? totalCost / outfit.wearCount : null;

      return {
        ...outfit,
        itemCount: outfitItems.length,
        totalCost,
        costPerWear,
        items: outfitItems,
      };
    }).sort((a, b) => b.wearCount - a.wearCount);
  }, [outfits, items]);

  const handleLogItemWear = (itemId: string) => {
    logWear(itemId);
    toast({ title: 'Wear logged!', description: 'Item wear count updated.' });
  };

  const handleLogOutfitWear = () => {
    if (!selectedOutfit) return;
    
    const itemIds = logOutfitWear(selectedOutfit.id, wearPhoto || undefined);
    
    // Log wear for each item in the outfit
    itemIds.forEach(id => logWear(id, selectedOutfit.id));
    
    toast({ 
      title: 'Outfit worn!', 
      description: `Logged wear for "${selectedOutfit.name}" and ${itemIds.length} items.` 
    });
    
    setShowLogWearDialog(false);
    setSelectedOutfitId(null);
    setWearPhoto('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWearPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout title="Stats" subtitle="Track your wardrobe analytics">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <ShirtIcon className="w-3.5 h-3.5" />
              <span>Total Items</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.totalItems}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Total Wears</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.totalWears}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Total Value</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${summaryStats.totalCost.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Avg $/Wear</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${summaryStats.avgCostPerWear.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Never Worn</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.neverWorn}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="items">Item Stats</TabsTrigger>
          <TabsTrigger value="outfits">Outfit Stats</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        {/* Item Stats Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category | 'all')}>
              <SelectTrigger className="w-40 bg-background">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOption} onValueChange={(v) => setSortOption(v as StatsSortOption)}>
              <SelectTrigger className="w-40 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="mostWorn">Most Worn</SelectItem>
                <SelectItem value="leastWorn">Least Worn</SelectItem>
                <SelectItem value="bestValue">Best Value ($/wear)</SelectItem>
                <SelectItem value="worstValue">Worst Value</SelectItem>
                <SelectItem value="recent">Recently Worn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            {itemStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No items found. Add items to your closet to see stats.
              </div>
            ) : (
              itemStats.slice(0, 20).map((item, index) => (
                <div key={item.id} className="glass-card rounded-xl p-3 flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image} alt={item.subcategory} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.subcategory}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-foreground">{item.wearCount} wears</p>
                    {item.costPerWear !== null && (
                      <p className="text-xs text-muted-foreground">${item.costPerWear.toFixed(2)}/wear</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLogItemWear(item.id)}
                    className="flex-shrink-0"
                  >
                    Log Wear
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Outfit Stats Tab */}
        <TabsContent value="outfits" className="space-y-4">
          {outfitStats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No outfits saved yet. Create outfits in the Outfit Builder.
            </div>
          ) : (
            <div className="grid gap-4">
              {outfitStats.map(outfit => (
                <div key={outfit.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{outfit.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {outfit.itemCount} items • Created {format(new Date(outfit.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedOutfitId(outfit.id);
                        setShowLogWearDialog(true);
                      }}
                      className="gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Log Wear
                    </Button>
                  </div>

                  {/* Item thumbnails */}
                  <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                    {outfit.items.map(item => (
                      <div key={item.id} className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.image} alt={item.subcategory} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Worn: </span>
                      <span className="font-medium text-foreground">{outfit.wearCount}x</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Cost: </span>
                      <span className="font-medium text-foreground">${outfit.totalCost.toFixed(0)}</span>
                    </div>
                    {outfit.costPerWear !== null && (
                      <div>
                        <span className="text-muted-foreground">$/Wear: </span>
                        <span className="font-medium text-foreground">${outfit.costPerWear.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Wear history with photos */}
                  {outfit.wearLogs && outfit.wearLogs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Wear History</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {outfit.wearLogs.map(log => (
                          <div key={log.id} className="flex-shrink-0 text-center">
                            {log.photo ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted mb-1">
                                <img src={log.photo} alt="Outfit worn" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-1">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(log.date), 'MMM d')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          {/* Wear Frequency Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Wear Frequency (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wearFrequencyData}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }} 
                      interval="preserveStartEnd"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }} 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(152, 40%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {categoryData.length === 0 ? (
                  <p className="text-muted-foreground">No items to display</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Outfit Wear Dialog */}
      <Dialog open={showLogWearDialog} onOpenChange={setShowLogWearDialog}>
        <DialogContent className="max-w-sm bg-popover">
          <DialogHeader>
            <DialogTitle>Log Outfit Wear</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Logging wear for <span className="font-medium text-foreground">{selectedOutfit?.name}</span>
            </p>

            <div>
              <Label className="mb-2 block">Photo (optional)</Label>
              <div className="flex gap-3">
                {wearPhoto ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img src={wearPhoto} alt="Outfit photo" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setWearPhoto('')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add photo</span>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              This will also log a wear for each item in the outfit.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowLogWearDialog(false);
                  setSelectedOutfitId(null);
                  setWearPhoto('');
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleLogOutfitWear}>
                Log Wear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Stats;
