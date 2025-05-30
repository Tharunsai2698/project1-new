'use client';
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Utensils,
  Clock,
  FileClock,
  Trash2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfMonth } from "date-fns";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/components/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// IST is UTC+5:30
const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

const toIST = (date) => {
  return new Date(date.getTime() + IST_OFFSET);
};

const formatDate = (isoStr) => {
  const date = new Date(isoStr);
  const istDate = toIST(date);
  return istDate.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Helper function to normalize dates (set to start/end of day for proper comparison)
const normalizeDate = (date, isStart = true) => {
  if (!date) return undefined;
  const d = new Date(date);
  if (isStart) {
    d.setHours(0, 0, 0, 0);
  } else {
    d.setHours(23, 59, 59, 999);
  }
  return d;
};

const downloadCSV = (data, mealDetailsMap) => {
  let csvContent = "Meal Type,Meal Name,Date,Time,Total Calories,Total Protein (g),Total Carbs (g),Total Fats (g),Food Item,Item Weight (g),Item Calories,Item Protein (g),Item Carbs (g),Item Fats (g)\n";

  data.forEach((meal) => {
    const date = new Date(meal.consumed_at);
    const istDate = toIST(date);
    const dateStr = istDate.toLocaleDateString('en-IN');
    const timeStr = istDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const mealSummary = `"${meal.meal_type}","${meal.meal_name}","${dateStr}","${timeStr}","${meal.calories}","${meal.protein}","${meal.carbs}","${meal.fats}"`;

    if (mealDetailsMap[meal.id] && mealDetailsMap[meal.id].length > 0) {
      mealDetailsMap[meal.id].forEach((food) => {
        const foodRow = `${mealSummary},"${food.name}","${food.weight_g}","${food.calories}","${food.protein_g}","${food.carbs_g}","${food.fats_g}"`;
        csvContent += foodRow + "\n";
      });

      const totalCalories = mealDetailsMap[meal.id].reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = mealDetailsMap[meal.id].reduce((sum, food) => sum + food.protein_g, 0);
      const totalCarbs = mealDetailsMap[meal.id].reduce((sum, food) => sum + food.carbs_g, 0);
      const totalFats = mealDetailsMap[meal.id].reduce((sum, food) => sum + food.fats_g, 0);
      
      const totalRow = `${mealSummary},"TOTAL","","${totalCalories}","${totalProtein}","${totalCarbs}","${totalFats}"`;
      csvContent += totalRow + "\n";
    } else {
      csvContent += `${mealSummary},"","","","","",""` + "\n";
    }

    csvContent += "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "detailed-meal-history.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [mealDetails, setMealDetails] = useState({});
  const [expandedMeals, setExpandedMeals] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    from: normalizeDate(subDays(new Date(), 7)),
    to: normalizeDate(new Date(), false)
  });
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const itemsPerPage = 5;

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_history')
        .select('*')
        .eq('user_id', user.id)
        .order('consumed_at', { ascending: false });

      if (error) throw error;

      const entriesWithImages = data.filter(entry => entry.image_path);
      const paths = entriesWithImages.map(entry => entry.image_path);
      
      if (paths.length > 0) {
        const { data: signedUrls, error: urlError } = await supabase
          .storage
          .from('meal-images')
          .createSignedUrls(paths, 3600);

        if (urlError) throw urlError;

        const urlMap = {};
        signedUrls.forEach(({ signedUrl }, index) => {
          urlMap[entriesWithImages[index].id] = signedUrl;
        });
        setImageUrls(urlMap);
      }

      setHistory(data || []);
      
      const mealIds = data.map(meal => meal.id);
      if (mealIds.length > 0) {
        const { data: foodsData, error: foodsError } = await supabase
          .from('meal_foods')
          .select('*')
          .in('meal_id', mealIds);

        if (foodsError) throw foodsError;

        const detailsMap = {};
        foodsData.forEach(food => {
          if (!detailsMap[food.meal_id]) {
            detailsMap[food.meal_id] = [];
          }
          detailsMap[food.meal_id].push(food);
        });
        setMealDetails(detailsMap);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load meal history');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history
      .filter((entry) => {
        const entryDate = new Date(entry.consumed_at);
        const matchSearch = entry.meal_name.toLowerCase().includes(search.toLowerCase());
        const matchMeal = mealFilter ? entry.meal_type === mealFilter : true;
        
        // Date filtering logic
        let matchDate = true;
        if (dateRange.from || dateRange.to) {
          if (dateRange.from && dateRange.to) {
            matchDate = entryDate >= normalizeDate(dateRange.from) && 
                      entryDate <= normalizeDate(dateRange.to, false);
          } else if (dateRange.from) {
            matchDate = entryDate >= normalizeDate(dateRange.from);
          } else if (dateRange.to) {
            matchDate = entryDate <= normalizeDate(dateRange.to, false);
          }
        }
        
        return matchSearch && matchMeal && matchDate;
      })
      .sort((a, b) => {
        if (sortOption === "calories-asc") return a.calories - b.calories;
        if (sortOption === "calories-desc") return b.calories - a.calories;
        if (sortOption === "newest") return new Date(b.consumed_at) - new Date(a.consumed_at);
        if (sortOption === "oldest") return new Date(a.consumed_at) - new Date(b.consumed_at);
        return 0;
      });
  }, [history, search, mealFilter, sortOption, dateRange.from, dateRange.to]);

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const totalCaloriesToday = useMemo(() => {
    const today = new Date();
    const todayStart = normalizeDate(today);
    const todayEnd = normalizeDate(today, false);

    return history
      .filter((entry) => {
        const entryDate = new Date(entry.consumed_at);
        return entryDate >= todayStart && entryDate <= todayEnd;
      })
      .reduce((sum, entry) => sum + entry.calories, 0);
  }, [history]);

  const handleDelete = async (id) => {
    try {
      const entry = history.find(item => item.id === id);
      
      if (entry?.image_path) {
        const { error: storageError } = await supabase.storage
          .from('meal-images')
          .remove([entry.image_path]);
        
        if (storageError) throw storageError;
      }

      const { error: foodsError } = await supabase
        .from('meal_foods')
        .delete()
        .eq('meal_id', id);
      
      if (foodsError) throw foodsError;

      const { error } = await supabase.from('meal_history').delete().eq('id', id);
      if (error) throw error;
      
      setHistory(prev => prev.filter(entry => entry.id !== id));
      setImageUrls(prev => {
        const newUrls = {...prev};
        delete newUrls[id];
        return newUrls;
      });
      
      toast.success('Meal deleted successfully');
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
    }
  };

  const toggleMealExpansion = (mealId) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  const getMealTotalCalories = (meal) => {
    if (mealDetails[meal.id]?.length > 0) {
      return mealDetails[meal.id].reduce((sum, food) => sum + food.calories, 0);
    }
    return meal.calories;
  };

  const filtersApplied = search || mealFilter || sortOption !== "newest" || dateRange.from || dateRange.to;

  const quickDateSelect = (range) => {
    const thisday = new Date();
    switch(range) {
      case 'today':
        
        setDateRange({
          from: normalizeDate(thisday),
          to: normalizeDate(thisday, false)
        });
        break;
      case 'week':
        setDateRange({
          from: normalizeDate(subDays(new Date(), 7)),
          to: normalizeDate(new Date(), false)
        });
        break;
      case 'month':
        setDateRange({
          from: normalizeDate(startOfMonth(thisday)),
          to: normalizeDate(thisday, false)
        });
        break;
      case 'all':
        setDateRange({ from: undefined, to: undefined });
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  return (
    <div className="px-50 pt-29 p-6 py-24 w-full mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Utensils className="h-10 w-10 text-primary" />
        MEAL HISTORY
      </h1>

      <div className="text-center text-muted-foreground mb-6">
        <p>Today's total intake: <span className="font-semibold">{totalCaloriesToday}</span> kcal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search meals..."
          className="w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={setMealFilter} value={mealFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Meal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange?.to ? (
                  dateRange.from.getTime() === dateRange.to.getTime() ? (
                    format(dateRange.from, "MMM d, yyyy")
                  ) : (
                    `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                  )
                ) : (
                  `${format(dateRange.from, "MMM d, yyyy")}`
                )
              ) : (
                "Select Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex gap-2 p-2 border-b">
              <Button variant="outline" size="sm" onClick={() => quickDateSelect('today')}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickDateSelect('week')}>
                Last 7 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickDateSelect('month')}>
                This month
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickDateSelect('all')}>
                All time
              </Button>
            </div>
            <Calendar
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to
              }}
              onSelect={(range) => {
                if (!range) {
                  setDateRange({ from: undefined, to: undefined });
                  return;
                }
                
                if (range.from && !range.to) {
                  // Only from date selected
                  setDateRange({
                    from: normalizeDate(range.from),
                    to: undefined
                  });
                } else if (range.from && range.to) {
                  // Both dates selected (handle if selected in reverse order)
                  const fromDate = range.from < range.to ? range.from : range.to;
                  const toDate = range.from < range.to ? range.to : range.from;
                  setDateRange({
                    from: normalizeDate(fromDate),
                    to: normalizeDate(toDate, false)
                  });
                }
                setCurrentPage(1);
              }}
              initialFocus
              disabled={(date) => date > new Date()}
              defaultMonth={dateRange.from || new Date()}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select onValueChange={setSortOption} value={sortOption}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest to Oldest</SelectItem>
            <SelectItem value="oldest">Oldest to Newest</SelectItem>
            <SelectItem value="calories-asc">Calories (Low to High)</SelectItem>
            <SelectItem value="calories-desc">Calories (High to Low)</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => downloadCSV(filteredHistory, mealDetails)}
          disabled={filteredHistory.length === 0}
        >
          <FileClock className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {filtersApplied && (
        <div className="text-right mb-4">
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              setSearch("");
              setMealFilter("");
              setDateRange({ from: undefined, to: undefined });
              setSortOption("newest");
              setCurrentPage(1);
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Showing {filteredHistory.length} {filteredHistory.length === 1 ? "record" : "records"}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : paginatedHistory.length === 0 ? (
        <Card className="text-center p-8 rounded-2xl">
          <p className="text-muted-foreground">No meals found matching your criteria.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedHistory.map((entry) => (
            <Card key={entry.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">
                    {entry.meal_type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(entry.consumed_at)} (IST)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {getMealTotalCalories(entry)} kcal
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleMealExpansion(entry.id)}
                  >
                    {expandedMeals[entry.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {entry.image_path ? (
                    imageUrls[entry.id] ? (
                      <div className="relative">
                        <img
                          src={imageUrls[entry.id]}
                          alt="Meal"
                          className="w-full sm:w-32 h-32 object-cover rounded-lg border"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/food-placeholder.png';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )
                  ) : (
                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <Utensils className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium">{entry.meal_name}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Total Calories</p>
                        <p className="font-medium">{getMealTotalCalories(entry)} kcal</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Protein</p>
                        <p className="font-medium">{entry.protein}g</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Carbs</p>
                        <p className="font-medium">{entry.carbs}g</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Fats</p>
                        <p className="font-medium">{entry.fats}g</p>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedMeals[entry.id] && mealDetails[entry.id] && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2">Food Items:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Food</TableHead>
                          <TableHead className="text-right">Weight (g)</TableHead>
                          <TableHead className="text-right">Calories</TableHead>
                          <TableHead className="text-right">Protein</TableHead>
                          <TableHead className="text-right">Carbs</TableHead>
                          <TableHead className="text-right">Fats</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mealDetails[entry.id].map((food, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{food.name}</TableCell>
                            <TableCell className="text-right">{food.weight_g}g</TableCell>
                            <TableCell className="text-right">{food.calories} kcal</TableCell>
                            <TableCell className="text-right">{food.protein_g}g</TableCell>
                            <TableCell className="text-right">{food.carbs_g}g</TableCell>
                            <TableCell className="text-right">{food.fats_g}g</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}