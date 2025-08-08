'use client';

import { useState, useEffect } from 'react';
import type { ToDo } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { TodoList } from '@/components/todo-list';
import { Alarm } from '@/components/alarm';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [todos, setTodos] = useState<ToDo[]>([]);
  const [ringingTodo, setRingingTodo] = useState<ToDo | null>(null);

  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'alarm' && value) {
            return new Date(value);
          }
          return value;
        });
        setTodos(parsedTodos);
      }
    } catch (error) {
      console.error("Failed to load todos from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error("Failed to save todos to localStorage", error);
    }
  }, [todos]);

  useEffect(() => {
    if (ringingTodo) return;

    const interval = setInterval(() => {
      const now = new Date();
      const dueTodo = todos.find(
        (todo) =>
          !todo.completed &&
          todo.alarm &&
          now >= todo.alarm &&
          // A simple way to avoid re-notifying for a todo that was just dismissed
          // by checking if it's the one currently in the ringing state.
          ringingTodo?.id !== todo.id
      );

      if (dueTodo) {
        // Find if an alarm is already showing for another todo.
        // This simple implementation only shows one alarm at a time.
        if (!document.querySelector('[role="alertdialog"]')) {
           setRingingTodo(dueTodo);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [todos, ringingTodo]);

  const handleAddTodo = (todoData: Omit<ToDo, 'id' | 'completed'>) => {
    const newTodo: ToDo = {
      ...todoData,
      id: crypto.randomUUID(),
      completed: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggleComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleUpdateTodo = (updatedTodo: ToDo) => {
    setTodos((prev) => prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)));
  };

  const dismissAlarm = () => {
    if (ringingTodo) {
      // Mark as completed to prevent re-triggering.
      handleToggleComplete(ringingTodo.id);
      setRingingTodo(null);
    }
  };

  const upcomingTodos = todos.filter((t) => !t.completed).sort((a, b) => (a.alarm?.getTime() ?? Infinity) - (b.alarm?.getTime() ?? Infinity));
  const completedTodos = todos.filter((t) => t.completed).sort((a,b) => (b.alarm?.getTime() ?? 0) - (a.alarm?.getTime() ?? 0));

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader onAddTodo={handleAddTodo} />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4">Upcoming</h2>
          <TodoList
            todos={upcomingTodos}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTodo}
            onUpdate={handleUpdateTodo}
          />
        </section>
        
        {completedTodos.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-4 text-muted-foreground">Completed</h2>
              <TodoList
                todos={completedTodos}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
                onUpdate={handleUpdateTodo}
              />
            </section>
          </>
        )}
      </main>
      {ringingTodo && (
        <Alarm
          todo={ringingTodo}
          onDismiss={dismissAlarm}
        />
      )}
    </div>
  );
}
