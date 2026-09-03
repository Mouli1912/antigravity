"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/lib/intelligence";

type EventKind = "Birthday" | "Event" | "Deadline";
type CalendarEvent = { id: number; title: string; date: string; kind: EventKind; time?: string };

const kindStyles: Record<EventKind, string> = {
  Birthday: "bg-pink-500/15 text-pink-600 dark:text-pink-300",
  Event: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  Deadline: "bg-red-500/15 text-red-600 dark:text-red-300",
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventKind, setEventKind] = useState<EventKind>("Event");
  const [eventTime, setEventTime] = useState("");
  const [now, setNow] = useState(today);

  useEffect(() => {
    const stored = localStorage.getItem("antigravity_calendar_events");
    if (stored) {
      try { setEvents(JSON.parse(stored)); } catch { setEvents([]); }
    }
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("antigravity_calendar_events", JSON.stringify(events));
  }, [events]);

  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: Math.ceil((firstDay + totalDays) / 7) * 7 }, (_, index) => {
      const day = index - firstDay + 1;
      return day > 0 && day <= totalDays ? new Date(month.getFullYear(), month.getMonth(), day) : null;
    });
  }, [month]);

  const selectedTasks = tasks.filter(task => (task.date || task.createdAt.slice(0, 10)) === selectedDate);
  const selectedEvents = events.filter(event => event.date === selectedDate);

  const addEvent = () => {
    if (!eventTitle.trim()) return;
    setEvents(current => [...current, { id: Date.now(), title: eventTitle.trim(), date: selectedDate, kind: eventKind, time: eventTime }]);
    setEventTitle("");
    setEventTime("");
    setShowForm(false);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h2 className="text-3xl font-black tracking-tight">Your calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Plan important work, birthdays, events, and deadlines in one place.</p>
        </div>
        <Button onClick={() => setShowForm(value => !value)}><Plus className="mr-2 h-4 w-4" /> Add calendar item</Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_150px_150px_auto]">
            <Input value={eventTitle} onChange={event => setEventTitle(event.target.value)} placeholder="Birthday, event, or deadline" aria-label="Calendar item title" />
            <select value={eventKind} onChange={event => setEventKind(event.target.value as EventKind)} className="h-9 rounded-md border bg-background px-3 text-sm">
              <option>Event</option><option>Birthday</option><option>Deadline</option>
            </select>
            <Input type="time" value={eventTime} onChange={event => setEventTime(event.target.value)} aria-label="Calendar item time" />
            <Button onClick={addEvent}>Save</Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3></div>
            <div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft /></Button><Button variant="ghost" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight /></Button></div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day} className="py-2">{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className="min-h-20 rounded-lg bg-muted/20 sm:min-h-24" />;
              const key = toDateKey(day);
              const dayTasks = tasks.filter(task => (task.date || task.createdAt.slice(0, 10)) === key);
              const dayEvents = events.filter(event => event.date === key);
              return <button key={key} onClick={() => setSelectedDate(key)} className={`min-h-20 rounded-lg border p-2 text-left transition-colors hover:bg-accent sm:min-h-24 ${selectedDate === key ? "border-primary bg-primary/10" : "bg-background"}`}>
                <span className={`text-sm font-semibold ${key === toDateKey(today) ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground" : ""}`}>{day.getDate()}</span>
                <div className="mt-2 space-y-1 overflow-hidden">{dayTasks.slice(0, 2).map(task => <div key={task.id} className={`truncate rounded px-1 text-[10px] ${task.priority === "High" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>{task.priority === "High" ? "Important: " : ""}{task.title}</div>)}{dayEvents.slice(0, 2).map(event => <div key={event.id} className={`truncate rounded px-1 text-[10px] ${kindStyles[event.kind]}`}>{event.title}</div>)}</div>
              </button>;
            })}
          </div>
        </div>

        <aside className="rounded-2xl border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected day</p><h3 className="mt-1 text-xl font-bold">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</h3></div><Button variant="outline" size="sm" onClick={() => setShowForm(true)}><Plus className="mr-1 h-4 w-4" /> Add</Button></div><div className="space-y-3">{selectedTasks.map(task => <div key={task.id} className="rounded-xl border-l-4 border-amber-500 bg-muted/40 p-3"><div className="flex items-center justify-between gap-2"><span className="font-medium">{task.title}</span>{task.priority === "High" && <span className="text-[10px] font-bold uppercase text-amber-600">Important</span>}</div><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" />{task.time}</p></div>)}{selectedEvents.map(event => <div key={event.id} className={`rounded-xl p-3 ${kindStyles[event.kind]}`}><div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider">{event.kind}</p><p className="font-medium">{event.title}</p>{event.time && <p className="mt-1 text-xs opacity-75">{event.time}</p>}</div><button onClick={() => setEvents(current => current.filter(item => item.id !== event.id))} aria-label={`Delete ${event.title}`}><X className="h-4 w-4" /></button></div></div>)}{selectedTasks.length === 0 && selectedEvents.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Nothing planned for this day.</p>}</div></aside>
      </div>
    </section>
  );
}