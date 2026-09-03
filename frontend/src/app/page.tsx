"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Check, X, LayoutDashboard, Calendar, BarChart2, Settings, Trophy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useGamification } from "@/hooks/useGamification";
import { useTasks } from "@/hooks/useTasks";
import { XPBar } from "@/components/gamification/XPBar";
import { StreakWidget } from "@/components/gamification/StreakWidget";
import { AchievementModal } from "@/components/gamification/AchievementModal";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { TaskHeatIndicator } from "@/components/intelligence/TaskHeatIndicator";
import { InterventionModal } from "@/components/intelligence/InterventionModal";
import { AnalyticsWidget } from "@/components/intelligence/AnalyticsWidget";
import { CalendarView } from "@/components/calendar/CalendarView";
import { XP_VALUES } from "@/lib/gamification";
import { INTERVENTION_THRESHOLD, Task, Subtask } from "@/lib/intelligence";
export default function Dashboard() {
  const { state: gamificationState, addXP, justLeveledUp, newlyUnlockedBadges, clearNewlyUnlockedBadges, isLoaded: gamificationLoaded } = useGamification();
  const { tasks, isLoaded: tasksLoaded, recoveredTasksCount, addTask, completeTask, updateTask, deleteTask, rescheduleTask, setSubtasks, completeSubtask } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState("Dashboard");

  const [interventionTask, setInterventionTask] = useState<Task | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskTime, setEditTaskTime] = useState("");

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskTime, newTaskPriority, newTaskDate);
    setNewTaskTitle("");
    setNewTaskTime("");
    setNewTaskDate(new Date().toISOString().slice(0, 10));
    setNewTaskPriority("Medium");
    setIsDialogOpen(false);
  };

  const handleCompleteTask = (task: Task) => {
    if (task.completed) return;
    
    // Award XP
    let xpAmount = XP_VALUES.MEDIUM;
    if (task.priority === "High") xpAmount = XP_VALUES.HARD;
    if (task.priority === "Low") xpAmount = XP_VALUES.EASY;
    if (task.ignoreScore >= INTERVENTION_THRESHOLD) xpAmount += 25; // Bonus for recovery
    
    addXP(xpAmount);
    completeTask(task.id);
  };
  const handleDeleteTask = (id: number) => {
    deleteTask(id);
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskTime(task.time);
  };

  const handleSaveEdit = () => {
    if (editingTaskId !== null) {
      updateTask(editingTaskId, { title: editTaskTitle, time: editTaskTime });
      // If time changed significantly, we could call rescheduleTask instead
    }
    setEditingTaskId(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="w-20 border-r bg-card hidden md:flex flex-col py-4 items-center z-10">
        <div className="mb-8 flex justify-center">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            TF
          </div>
        </div>
        <nav className="flex-1 space-y-4 w-full px-3">
          {[
            { name: "Dashboard", icon: LayoutDashboard },
            { name: "Calendar", icon: Calendar },
            { name: "Analytics", icon: BarChart2 },
            { name: "Settings", icon: Settings },
          ].map((item) => (
              <div key={item.name} className="relative group w-full flex justify-center">
              <Button variant={activeView === item.name ? "secondary" : "ghost"} size="icon" className="h-12 w-12 rounded-xl" onClick={() => setActiveView(item.name)}>
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.name}</span>
              </Button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0 pointer-events-none z-50 whitespace-nowrap shadow-lg border">
                {item.name}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">AntiGravity</h1>
            {gamificationLoaded && <LevelBadge level={gamificationState.level} justLeveledUp={justLeveledUp} />}
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger render={<Button />}>+ New Task</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task to add to your daily schedule.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Task
                  </Label>
                  <Input 
                    id="title" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="E.g., Reply to emails"
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input 
                    id="time" 
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="E.g., 9:00 AM"
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date</Label>
                  <Input id="date" type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">Priority</Label>
                  <select id="priority" value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="col-span-3 h-9 rounded-md border bg-background px-3 text-sm">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </header>

        <div className={`flex-1 overflow-auto p-6 space-y-6 ${activeView === "Calendar" ? "hidden" : ""}`}>
          {gamificationLoaded && (
            <div className="glass-panel p-6 rounded-3xl mb-6">
              <XPBar xp={gamificationState.xp} level={gamificationState.level} />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card border-0">
              <CardHeader className="pb-2">
                <CardDescription>Tasks Remaining</CardDescription>
                <CardTitle className="text-3xl">{tasks.filter(t => !t.completed).length}</CardTitle>
              </CardHeader>
            </Card>
            
            {gamificationLoaded ? (
              <StreakWidget 
                currentStreak={gamificationState.currentStreak} 
                longestStreak={gamificationState.longestStreak} 
              />
            ) : (
              <Card className="glass-card border-0 opacity-50"><CardContent className="p-6">Loading streak...</CardContent></Card>
            )}

            <Card className="glass-card border-0">
              <CardHeader className="pb-2">
                <CardDescription>Achievements</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  {gamificationLoaded ? gamificationState.unlockedBadges.length : 0}
                </CardTitle>
              </CardHeader>
            </Card>

            {tasksLoaded && (
              <AnalyticsWidget recoveredTasksCount={recoveredTasksCount} />
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Incomplete Tasks</h2>
            <div className="space-y-3">
              {tasks.filter(t => !t.completed).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground glass-card rounded-xl">No tasks left! Great job.</div>
              ) : (
                tasks.filter(t => !t.completed).map((task) => (
                  <div key={task.id} className="flex flex-col gap-2 p-4 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:bg-card group">
                    <div className="flex items-center justify-between w-full">
                    {editingTaskId === task.id ? (
                      <div className="flex-1 flex items-center gap-3 w-full">
                        <div className="flex flex-col gap-2 flex-1">
                          <Input 
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            className="h-8"
                          />
                          <Input 
                            value={editTaskTime}
                            onChange={(e) => setEditTaskTime(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8 text-green-500 hover:text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 text-red-500 hover:text-red-600">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => handleCompleteTask(task)} />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`task-${task.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                {task.title}
                              </label>
                              <TaskHeatIndicator ignoreScore={task.ignoreScore} />
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">{task.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            {task.priority}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            {task.ignoreScore >= 2 && (
                              <Button size="sm" variant="outline" className="mr-2 text-xs border-orange-500/50 text-orange-500 hover:bg-orange-500/10" onClick={() => setInterventionTask(task)}>
                                Stuck?
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(task)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                    </div>
                    {/* Render Subtasks if any */}
                    {task.subtasks?.length > 0 && (
                      <div className="ml-8 mt-2 space-y-2 border-l-2 border-primary/20 pl-4">
                        {task.subtasks.map(sub => (
                          <div key={sub.id} className="flex items-center gap-2">
                            <Checkbox id={`sub-${sub.id}`} checked={sub.completed} onCheckedChange={() => completeSubtask(task.id, sub.id)} />
                            <label htmlFor={`sub-${sub.id}`} className={`text-xs ${sub.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {sub.title}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {activeView === "Calendar" && <div className="flex-1 overflow-auto p-6"><CalendarView tasks={tasks} /></div>}
      </main>
      <AchievementModal 
        unlockedBadgeIds={newlyUnlockedBadges} 
        onClose={clearNewlyUnlockedBadges} 
      />
      <InterventionModal
        task={interventionTask}
        onClose={() => setInterventionTask(null)}
        onApplySuggestions={setSubtasks}
      />
    </div>
  );
}
