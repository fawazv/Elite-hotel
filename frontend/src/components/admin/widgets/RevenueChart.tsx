import { useState, useEffect } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { subDays, startOfYear, format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { dashboardApi } from '@/services/dashboardApi'
import { cn } from '@/lib/utils'
import DateRangePicker from './DateRangePicker'

type FilterType = '7d' | '30d' | 'year' | 'custom'

const RevenueChart = () => {
  const [data, setData] = useState<{ date: string; amount: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('7d')
  
  // Active range used for fetching data
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>({
    from: subDays(new Date(), 7),
    to: new Date()
  })

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
  // Fetch data whenever the committed dateRange or filter changes
  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange?.from || !dateRange?.to) return

      setLoading(true)
      try {
        const interval = filter === 'year' ? 'month' : 'day'
        const chartData = await dashboardApi.getRevenueChartData(
          dateRange.from.toISOString(),
          dateRange.to.toISOString(),
          interval
        )
        setData(chartData)
      } catch (error) {
        console.error('Failed to load revenue chart', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange, filter])

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    const end = new Date()
    let start = new Date()

    switch (newFilter) {
      case '7d':
        start = subDays(end, 7)
        setDateRange({ from: start, to: end })
        break
      case '30d':
        start = subDays(end, 30)
        setDateRange({ from: start, to: end })
        break
      case 'year':
        start = startOfYear(end)
        setDateRange({ from: start, to: end })
        break
      case 'custom':
        setIsCalendarOpen(true)
        break
    }
  }

  return (
    <div className="h-[400px] w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Revenue Analytics</h3>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
          {/* Preset Filters */}
          {(['7d', '30d', 'year'] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                filter === f 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              {f === 'year' ? 'This Year' : `Last ${f.replace('d', ' Days')}`}
            </button>
          ))}
          
          {/* Custom Date Picker */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 py-1.5 h-auto text-sm font-medium rounded-md transition-all",
                  filter === 'custom' 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
                onClick={() => handleFilterChange('custom')}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {filter === 'custom' && dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  "Custom"
                )}
              </Button>
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-auto p-0 animate-in zoom-in-95 fade-in-0 duration-200" 
              align="end" 
              side="bottom" 
              sideOffset={8}
              avoidCollisions={false}
            >
              <DateRangePicker 
                date={dateRange} 
                setDate={setDateRange} 
                onClose={() => setIsCalendarOpen(false)} 
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 min-h-0 min-w-0 relative w-full">
         <div className="absolute inset-0 w-full h-full">
        {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
         </div>
      </div>
    </div>
  )
}

export default RevenueChart
