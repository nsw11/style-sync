import { useState, useMemo, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useClothingStore } from '@/hooks/useClothingStore';
import { useOutfitStore } from '@/hooks/useOutfitStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Download, Share2, ChevronRight, Trophy, DollarSign, Heart, Calendar, TrendingUp, Clock, Shirt, Star, Camera } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { format, startOfYear, endOfYear, isWithinInterval, subYears } from 'date-fns';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';

const WRAPPED_COLORS = {
  primary: 'hsl(220, 40%, 25%)', // Deep navy
  secondary: 'hsl(30, 25%, 45%)', // Warm brown
  accent: 'hsl(35, 30%, 60%)', // Muted gold
  muted: 'hsl(30, 10%, 70%)', // Warm gray
  background: 'hsl(30, 15%, 95%)', // Warm off-white
};

const CHART_COLORS = [
  'hsl(220, 40%, 35%)',
  'hsl(30, 35%, 50%)',
  'hsl(35, 40%, 55%)',
  'hsl(180, 25%, 45%)',
  'hsl(350, 30%, 50%)',
  'hsl(260, 25%, 45%)',
];

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay: number;
  isVisible: boolean;
}

function StatCard({ title, icon, children, delay, isVisible }: StatCardProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
    <Card className={cn(
      "transition-all duration-700 transform bg-gradient-to-br from-card to-card/80 border-border/50",
      show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-serif text-foreground/90">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function OutfitWrapped() {
  const { items } = useClothingStore();
  const { outfits } = useOutfitStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [currentSection, setCurrentSection] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const wrappedRef = useRef<HTMLDivElement>(null);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear - 1);
    
    items.forEach(item => {
      if (item.createdAt) years.add(new Date(item.createdAt).getFullYear());
      item.wearLogs?.forEach(log => years.add(new Date(log.date).getFullYear()));
    });
    
    outfits.forEach(outfit => {
      if (outfit.createdAt) years.add(new Date(outfit.createdAt).getFullYear());
      outfit.wearLogs?.forEach(log => years.add(new Date(log.date).getFullYear()));
    });
    
    return Array.from(years).sort((a, b) => b - a);
  }, [items, outfits]);

  const dateRange = useMemo(() => ({
    start: startOfYear(new Date(parseInt(selectedYear), 0, 1)),
    end: endOfYear(new Date(parseInt(selectedYear), 0, 1)),
  }), [selectedYear]);

  const stats = useMemo(() => {
    const withinRange = (date: Date) => isWithinInterval(date, dateRange);

    // Items with wear data in selected year
    const itemsWithYearWears = items.map(item => {
      const yearWears = (item.wearLogs || []).filter(log => withinRange(new Date(log.date)));
      return { ...item, yearWearCount: yearWears.length };
    }).filter(item => item.yearWearCount > 0);

    // Most worn piece
    const mostWorn = itemsWithYearWears.sort((a, b) => b.yearWearCount - a.yearWearCount)[0] || null;

    // Best bang for buck (items with cost and at least 1 wear)
    const itemsWithCostPerWear = itemsWithYearWears
      .filter(item => item.cost && item.cost > 0)
      .map(item => ({
        ...item,
        costPerWear: item.cost! / item.yearWearCount,
      }))
      .sort((a, b) => a.costPerWear - b.costPerWear);
    const bestValue = itemsWithCostPerWear[0] || null;

    // Favorite outfits
    const outfitsWithYearWears = outfits.map(outfit => {
      const yearWears = (outfit.wearLogs || []).filter(log => withinRange(new Date(log.date)));
      return { ...outfit, yearWearCount: yearWears.length };
    }).filter(outfit => outfit.yearWearCount > 0)
      .sort((a, b) => b.yearWearCount - a.yearWearCount);

    // Total outfits logged
    const totalOutfitsLogged = outfitsWithYearWears.reduce((sum, o) => sum + o.yearWearCount, 0);

    // Total wardrobe value
    const totalValue = items.reduce((sum, item) => sum + (item.cost || 0), 0);

    // Average cost per wear
    const totalWears = itemsWithYearWears.reduce((sum, item) => sum + item.yearWearCount, 0);
    const avgCostPerWear = totalWears > 0 && totalValue > 0 ? totalValue / totalWears : 0;

    // Category distribution
    const categoryWears: Record<string, number> = {};
    itemsWithYearWears.forEach(item => {
      categoryWears[item.category] = (categoryWears[item.category] || 0) + item.yearWearCount;
    });
    const categoryData = Object.entries(categoryWears)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Subcategory distribution
    const subcategoryWears: Record<string, number> = {};
    itemsWithYearWears.forEach(item => {
      if (item.subcategory) {
        subcategoryWears[item.subcategory] = (subcategoryWears[item.subcategory] || 0) + item.yearWearCount;
      }
    });
    const topSubcategories = Object.entries(subcategoryWears)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // New items this year
    const newItems = items.filter(item => 
      item.createdAt && withinRange(new Date(item.createdAt))
    );

    // Oldest item still in rotation
    const oldestInRotation = itemsWithYearWears
      .filter(item => item.createdAt)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())[0] || null;

    return {
      mostWorn,
      bestValue,
      favoriteOutfits: outfitsWithYearWears.slice(0, 3),
      totalOutfitsLogged,
      totalValue,
      avgCostPerWear,
      categoryData,
      topSubcategories,
      newItems,
      oldestInRotation,
      totalWears,
      totalItems: items.length,
    };
  }, [items, outfits, dateRange]);

  const startReveal = () => {
    setIsRevealing(true);
    setCurrentSection(0);
  };

  const nextSection = () => {
    setCurrentSection(prev => Math.min(prev + 1, 5));
  };

  const handleDownload = async () => {
    if (!wrappedRef.current) return;
    
    try {
      const canvas = await html2canvas(wrappedRef.current, {
        backgroundColor: '#f5f3f0',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `outfit-wrapped-${selectedYear}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${selectedYear} Outfit Wrapped`,
          text: `Check out my style recap for ${selectedYear}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  const getOutfitItems = (outfit: typeof outfits[0]) => {
    return Object.values(outfit.items)
      .filter(Boolean)
      .map(id => items.find(item => item.id === id))
      .filter(Boolean);
  };

  return (
    <AppLayout 
      title="Outfit Wrapped" 
      subtitle={`Your ${selectedYear} Style Recap`}
      actions={
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isRevealing && (
            <>
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      }
    >
      <div ref={wrappedRef} className="space-y-6 pb-12">
        {!isRevealing ? (
          <Card className="text-center py-16 bg-gradient-to-br from-[hsl(220,40%,25%)] to-[hsl(30,25%,35%)] border-0">
            <CardContent className="space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-[hsl(35,30%,70%)]" />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">
                  Your {selectedYear} Wrapped
                </h2>
                <p className="text-white/70 max-w-md mx-auto">
                  Discover your style journey through the year with personalized insights and statistics.
                </p>
              </div>
              <Button 
                onClick={startReveal}
                size="lg"
                className="bg-[hsl(35,30%,60%)] hover:bg-[hsl(35,30%,50%)] text-[hsl(220,40%,15%)] font-semibold"
              >
                Reveal My Wrapped
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Section 1: Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Total Items" icon={<Shirt className="w-5 h-5 text-primary" />} delay={0} isVisible={currentSection >= 0}>
                <p className="text-4xl font-bold font-serif text-primary">{stats.totalItems}</p>
                <p className="text-sm text-muted-foreground">in your wardrobe</p>
              </StatCard>
              <StatCard title="Times Worn" icon={<TrendingUp className="w-5 h-5 text-primary" />} delay={200} isVisible={currentSection >= 0}>
                <p className="text-4xl font-bold font-serif text-primary">{stats.totalWears}</p>
                <p className="text-sm text-muted-foreground">total wears logged</p>
              </StatCard>
              <StatCard title="Outfits Logged" icon={<Camera className="w-5 h-5 text-primary" />} delay={400} isVisible={currentSection >= 0}>
                <p className="text-4xl font-bold font-serif text-primary">{stats.totalOutfitsLogged}</p>
                <p className="text-sm text-muted-foreground">complete outfits</p>
              </StatCard>
              <StatCard title="Wardrobe Value" icon={<DollarSign className="w-5 h-5 text-primary" />} delay={600} isVisible={currentSection >= 0}>
                <p className="text-4xl font-bold font-serif text-primary">${stats.totalValue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">total investment</p>
              </StatCard>
            </div>

            {currentSection >= 0 && (
              <div className="flex justify-center">
                <Button variant="ghost" onClick={nextSection} className="gap-2" disabled={currentSection >= 5}>
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Section 2: Most Worn Piece */}
            {currentSection >= 1 && stats.mostWorn && (
              <StatCard title="Most Worn Piece" icon={<Trophy className="w-5 h-5 text-amber-500" />} delay={0} isVisible={currentSection >= 1}>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={stats.mostWorn.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-serif text-primary">{stats.mostWorn.yearWearCount} wears</p>
                    <p className="text-sm text-muted-foreground">{stats.mostWorn.category}</p>
                    <p className="text-sm text-muted-foreground">{stats.mostWorn.subcategory}</p>
                  </div>
                </div>
              </StatCard>
            )}

            {currentSection >= 1 && (
              <div className="flex justify-center">
                <Button variant="ghost" onClick={nextSection} className="gap-2" disabled={currentSection >= 5}>
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Section 3: Best Value */}
            {currentSection >= 2 && stats.bestValue && (
              <StatCard title="Best Bang for Your Buck" icon={<DollarSign className="w-5 h-5 text-green-500" />} delay={0} isVisible={currentSection >= 2}>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={stats.bestValue.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-serif text-green-600">${stats.bestValue.costPerWear.toFixed(2)}/wear</p>
                    <p className="text-sm text-muted-foreground">Cost: ${stats.bestValue.cost} • {stats.bestValue.yearWearCount} wears</p>
                    <p className="text-sm text-muted-foreground">{stats.bestValue.category} • {stats.bestValue.subcategory}</p>
                  </div>
                </div>
              </StatCard>
            )}

            {currentSection >= 2 && (
              <div className="flex justify-center">
                <Button variant="ghost" onClick={nextSection} className="gap-2" disabled={currentSection >= 5}>
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Section 4: Favorite Outfits */}
            {currentSection >= 3 && stats.favoriteOutfits.length > 0 && (
              <StatCard title="Favorite Outfit Combos" icon={<Heart className="w-5 h-5 text-rose-500" />} delay={0} isVisible={currentSection >= 3}>
                <div className="space-y-4">
                  {stats.favoriteOutfits.map((outfit, index) => {
                    const outfitItems = getOutfitItems(outfit);
                    return (
                      <div key={outfit.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          #{index + 1}
                        </div>
                        <div className="flex gap-1 flex-1">
                          {outfitItems.slice(0, 4).map((item, i) => (
                            <div key={i} className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                              <img src={item?.image} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {outfitItems.length > 4 && (
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
                              +{outfitItems.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{outfit.name}</p>
                          <p className="text-sm text-muted-foreground">{outfit.yearWearCount} wears</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </StatCard>
            )}

            {currentSection >= 3 && (
              <div className="flex justify-center">
                <Button variant="ghost" onClick={nextSection} className="gap-2" disabled={currentSection >= 5}>
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Section 5: Charts */}
            {currentSection >= 4 && (
              <div className="grid md:grid-cols-2 gap-6">
                <StatCard title="Category Distribution" icon={<TrendingUp className="w-5 h-5 text-primary" />} delay={0} isVisible={currentSection >= 4}>
                  {stats.categoryData.length > 0 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {stats.categoryData.map((_, index) => (
                              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No wear data for this period</p>
                  )}
                </StatCard>

                <StatCard title="Top Subcategories" icon={<Star className="w-5 h-5 text-amber-500" />} delay={200} isVisible={currentSection >= 4}>
                  {stats.topSubcategories.length > 0 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topSubcategories} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No subcategory data</p>
                  )}
                </StatCard>
              </div>
            )}

            {currentSection >= 4 && (
              <div className="flex justify-center">
                <Button variant="ghost" onClick={nextSection} className="gap-2" disabled={currentSection >= 5}>
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Section 6: Additional Stats */}
            {currentSection >= 5 && (
              <div className="grid md:grid-cols-3 gap-4">
                <StatCard title="New Additions" icon={<Calendar className="w-5 h-5 text-blue-500" />} delay={0} isVisible={currentSection >= 5}>
                  <p className="text-3xl font-bold font-serif text-primary">{stats.newItems.length}</p>
                  <p className="text-sm text-muted-foreground">items added in {selectedYear}</p>
                </StatCard>

                <StatCard title="Avg Cost/Wear" icon={<DollarSign className="w-5 h-5 text-primary" />} delay={200} isVisible={currentSection >= 5}>
                  <p className="text-3xl font-bold font-serif text-primary">
                    ${stats.avgCostPerWear > 0 ? stats.avgCostPerWear.toFixed(2) : '—'}
                  </p>
                  <p className="text-sm text-muted-foreground">across all items</p>
                </StatCard>

                {stats.oldestInRotation && (
                  <StatCard title="Oldest in Rotation" icon={<Clock className="w-5 h-5 text-amber-600" />} delay={400} isVisible={currentSection >= 5}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img src={stats.oldestInRotation.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{stats.oldestInRotation.subcategory}</p>
                        <p className="text-xs text-muted-foreground">
                          Since {format(new Date(stats.oldestInRotation.createdAt!), 'MMM yyyy')}
                        </p>
                      </div>
                    </div>
                  </StatCard>
                )}
              </div>
            )}

            {/* Final Actions */}
            {currentSection >= 5 && (
              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={handleDownload} className="gap-2 bg-[hsl(220,40%,25%)] hover:bg-[hsl(220,40%,30%)]">
                  <Download className="w-4 h-4" />
                  Download Wrapped
                </Button>
                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
