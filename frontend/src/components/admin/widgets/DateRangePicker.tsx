import React, { useState, useEffect } from 'react'
import { format, differenceInDays, setMonth, setYear, getMonth, getYear, addMonths } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { useDayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
    date: { from: Date; to?: Date } | undefined
    setDate: (date: { from: Date; to?: Date } | undefined) => void
    onClose: () => void
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ date, setDate, onClose }) => {
    // Local state for the picker before applying
    const [tempDateRange, setTempDateRange] = useState<{ from: Date; to?: Date } | undefined>(date)
    const [currentMonth, setCurrentMonth] = useState<Date>(date?.from || new Date())

    // Sync temp state when prop changes (e.g. if reset externally)
    useEffect(() => {
        setTempDateRange(date)
        if (date?.from) {
            setCurrentMonth(date.from)
        }
    }, [date])

    const handleApply = () => {
        setDate(tempDateRange)
        onClose()
    }

    const handleClear = () => {
        setTempDateRange(undefined)
    }

    const handleReset = () => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 7)
        setTempDateRange({ from: start, to: end })
        setCurrentMonth(start)
    }

    // Custom Caption Component (Month/Year Navigation)
    const CustomCaption = (props: any) => {
        const displayMonth = props.calendarMonth?.date || new Date()
        const { goToMonth } = useDayPicker()
        const [yearInput, setYearInput] = useState(getYear(displayMonth).toString())

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]

        const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newMonth = setMonth(displayMonth, parseInt(e.target.value))
            goToMonth(newMonth)
        }

        const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setYearInput(value)
            const yearNum = parseInt(value)
            if (!isNaN(yearNum) && yearNum > 1900 && yearNum < 2100) {
                const newMonth = setYear(displayMonth, yearNum)
                goToMonth(newMonth)
            }
        }

        const handlePrevMonth = () => {
            const newMonth = addMonths(displayMonth, -1)
            goToMonth(newMonth)
            setYearInput(getYear(newMonth).toString())
        }

        const handleNextMonth = () => {
            const newMonth = addMonths(displayMonth, 1)
            goToMonth(newMonth)
            setYearInput(getYear(newMonth).toString())
        }

        useEffect(() => {
            setYearInput(getYear(displayMonth).toString())
        }, [displayMonth])

        return (
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
                <button
                    onClick={handlePrevMonth}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded transition-colors uppercase tracking-wider"
                >
                    PREV
                </button>

                <div className="flex items-center gap-3">
                    <select
                        value={getMonth(displayMonth)}
                        onChange={handleMonthChange}
                        className="text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-md px-3 py-1.5 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer transition-all"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        value={yearInput}
                        onChange={handleYearChange}
                        className="text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-md px-3 py-1.5 w-20 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        min="1900"
                        max="2100"
                    />
                </div>

                <button
                    onClick={handleNextMonth}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded transition-colors uppercase tracking-wider"
                >
                    NEXT
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-[24px] shadow-2xl shadow-purple-900/10 border border-gray-100 overflow-hidden w-auto flex flex-col font-sans">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 border-b border-purple-100/50">
                <div className="flex gap-4">
                    {/* From Card */}
                    <div
                        className={cn(
                            "flex-1 bg-white p-4 rounded-2xl border-2 transition-all duration-300 min-w-[140px] relative overflow-hidden group hover:shadow-md",
                            (!tempDateRange?.from)
                                ? "ring-2 ring-purple-500 border-purple-400 shadow-lg shadow-purple-200"
                                : tempDateRange?.from
                                    ? "border-purple-300 shadow-sm"
                                    : "border-gray-100 shadow-sm text-gray-500"
                        )}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">From</p>
                        <p className={cn(
                            "text-lg font-bold tracking-tight",
                            (!tempDateRange?.from) ? "text-purple-700" : tempDateRange?.from ? "text-purple-900" : "text-gray-900"
                        )}>
                            {tempDateRange?.from ? format(tempDateRange.from, 'EEE, dd MMM') : 'Select Date'}
                        </p>
                        {(!tempDateRange?.from) && <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />}
                    </div>

                    {/* To Card */}
                    <div
                        className={cn(
                            "flex-1 bg-white p-4 rounded-2xl border-2 transition-all duration-300 min-w-[140px] relative overflow-hidden group hover:shadow-md",
                            (tempDateRange?.from && !tempDateRange?.to)
                                ? "ring-2 ring-purple-500 border-purple-400 shadow-lg shadow-purple-200"
                                : tempDateRange?.to
                                    ? "border-purple-300 shadow-sm"
                                    : "border-gray-100 shadow-sm text-gray-500"
                        )}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">To</p>
                        <p className={cn(
                            "text-lg font-bold tracking-tight",
                            (tempDateRange?.from && !tempDateRange?.to) ? "text-purple-700" : tempDateRange?.to ? "text-purple-900" : "text-gray-900"
                        )}>
                            {tempDateRange?.to ? format(tempDateRange.to, 'EEE, dd MMM') : 'Select Date'}
                        </p>
                        {(tempDateRange?.from && !tempDateRange?.to) && <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />}
                    </div>
                </div>

                {/* Duration Indicator */}
                <div className="mt-4 flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-purple-100 shadow-sm">
                        <p className="text-xs font-semibold text-purple-700">
                            {tempDateRange?.from && tempDateRange?.to
                                ? `${differenceInDays(tempDateRange.to, tempDateRange.from) + 1} Days Selected`
                                : !tempDateRange?.from ? "Start by selecting a date" : "Select end date"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="p-5 bg-white flex justify-center relative">
               <style>{`
                 /* Custom Range Styling for React Day Picker */
                 .rdp-cell:has(.day-range-start),
                 .rdp-cell:has(.day-range-end),
                 .rdp-cell:has(.day-range-middle) {
                    background-color: #F3E8FF !important; /* purple-100 */
                 }
                 
                 .rdp-cell:has(.day-range-start) {
                    border-top-left-radius: 50%;
                    border-bottom-left-radius: 50%;
                    background-color: #F3E8FF !important;
                 }
                 
                 .rdp-cell:has(.day-range-end) {
                    border-top-right-radius: 50%;
                    border-bottom-right-radius: 50%;
                     background-color: #F3E8FF !important;
                 }

                 /* Ensure the button itself is the solid circle */
                 .day-range-start,
                 .day-range-end {
                    background-color: #9333EA !important; /* purple-600 */
                    color: white !important;
                    border-radius: 50% !important;
                    opacity: 1 !important;
                 }
                
                .day-range-middle {
                    background-color: transparent !important;
                    color: #6B21A8 !important; /* purple-800 */
                    border-radius: 0 !important;
                }

                /* Fix alignment */
                .rdp-table {
                    border-collapse: collapse;
                    width: 100%;
                }
                
                .rdp-head_cell {
                     font-weight: 700;
                     color: #9CA3AF; /* gray-400 */
                     text-transform: uppercase;
                     font-size: 0.8rem;
                     height: 2.25rem;
                     width: 2.25rem;
                     padding-bottom: 0.5rem;
                }
                
                .rdp-cell {
                    height: 2.25rem;
                    width: 2.25rem;
                    padding: 0;
                    text-align: center;
                }
                
                .rdp-day {
                    height: 2.25rem;
                    width: 2.25rem;
                    border-radius: 50%;
                }
                
                .rdp-day:hover:not(.day-range-start):not(.day-range-end):not(.day-range-middle) {
                    background-color: #FAF5FF; /* purple-50 */
                }
               `}</style>
                <Calendar
                    initialFocus
                    mode="range"
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    selected={tempDateRange}
                    onSelect={(range) => setTempDateRange(range as { from: Date; to?: Date } | undefined)}
                    numberOfMonths={1}
                    // @ts-ignore - MonthCaption component override for v9
                    components={{
                        MonthCaption: CustomCaption
                    }}
                    className="rounded-md border-none p-0"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center mb-2 min-h-[40px] w-full",
                      nav: "hidden", 
                      table: "w-full border-collapse", 
                      head_row: "flex w-full mb-2",
                      head_cell: "rdp-head_cell text-center",
                      row: "flex w-full mt-2",
                      cell: "rdp-cell p-0 m-0",
                      day: "rdp-day p-0 font-normal text-gray-700 focus:outline-none transition-all duration-200 mx-auto",
                      day_range_end: "day-range-end",
                      day_range_start: "day-range-start",
                      day_selected: "day-selected",
                      day_today: "bg-gray-100 text-gray-900 font-bold border-2 border-gray-400 rounded-full",
                      day_outside: "text-gray-300 opacity-50",
                      day_disabled: "text-gray-300 opacity-50",
                      day_range_middle: "day-range-middle",
                      day_hidden: "invisible",
                    }}
                />
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 p-5 pt-0 bg-white pb-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-bold h-12 text-sm uppercase tracking-wide transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApply}
                        className="flex-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 text-sm uppercase tracking-wide shadow-xl shadow-purple-200 transition-all hover:shadow-purple-300 transform active:scale-95"
                        disabled={!tempDateRange?.from || !tempDateRange?.to}
                    >
                        Apply Range
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        className="flex-1 rounded-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 font-bold h-10 text-xs uppercase tracking-wide transition-all"
                        disabled={!tempDateRange?.from && !tempDateRange?.to}
                    >
                        Clear Selection
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-bold h-10 text-xs uppercase tracking-wide transition-all"
                    >
                        Reset to Default
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DateRangePicker
