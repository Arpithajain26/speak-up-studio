import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Filter, X, Video, VideoOff, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export interface SessionFilterValues {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  minScore: number;
  videoFilter: 'all' | 'with-video' | 'without-video';
}

interface SessionFiltersProps {
  filters: SessionFilterValues;
  onFiltersChange: (filters: SessionFilterValues) => void;
  totalCount: number;
  filteredCount: number;
}

export const defaultFilters: SessionFilterValues = {
  dateFrom: undefined,
  dateTo: undefined,
  minScore: 0,
  videoFilter: 'all',
};

export const SessionFilters = ({ filters, onFiltersChange, totalCount, filteredCount }: SessionFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateFrom !== undefined ||
      filters.dateTo !== undefined ||
      filters.minScore > 0 ||
      filters.videoFilter !== 'all'
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.minScore > 0) count++;
    if (filters.videoFilter !== 'all') count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const updateFilter = (partial: Partial<SessionFilterValues>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={isOpen ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs min-w-[20px] h-5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <>
            <span className="text-sm text-muted-foreground">
              {filteredCount} of {totalCount} sessions
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
              Clear all
            </Button>
          </>
        )}
      </div>

      {isOpen && (
        <div className="bg-muted/50 rounded-xl p-4 space-y-5 border border-border">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Date Range
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'w-[150px] justify-start text-left font-normal',
                      !filters.dateFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                    {filters.dateFrom ? format(filters.dateFrom, 'MMM d, yyyy') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => updateFilter({ dateFrom: date })}
                    disabled={(date) => date > new Date() || (filters.dateTo ? date > filters.dateTo : false)}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-sm text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'w-[150px] justify-start text-left font-normal',
                      !filters.dateTo && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                    {filters.dateTo ? format(filters.dateTo, 'MMM d, yyyy') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => updateFilter({ dateTo: date })}
                    disabled={(date) => date > new Date() || (filters.dateFrom ? date < filters.dateFrom : false)}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
              {(filters.dateFrom || filters.dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter({ dateFrom: undefined, dateTo: undefined })}
                  className="h-8 px-2"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Score Threshold */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Minimum Score: {filters.minScore}%
            </label>
            <Slider
              value={[filters.minScore]}
              onValueChange={(val) => updateFilter({ minScore: val[0] })}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Video Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              Video
            </label>
            <div className="flex gap-2">
              {[
                { value: 'all' as const, label: 'All', icon: null },
                { value: 'with-video' as const, label: 'With video', icon: Video },
                { value: 'without-video' as const, label: 'Without video', icon: VideoOff },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={filters.videoFilter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter({ videoFilter: option.value })}
                  className="gap-1.5"
                >
                  {option.icon && <option.icon className="w-3.5 h-3.5" />}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
