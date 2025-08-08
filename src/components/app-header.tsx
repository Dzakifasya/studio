'use client';

import { BellRing, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTodoDialog } from '@/components/add-todo-dialog';
import type { ToDo } from '@/lib/types';

interface AppHeaderProps {
  onAddTodo: (todoData: Omit<ToDo, 'id' | 'completed'>) => void;
}

export function AppHeader({ onAddTodo }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-headline font-bold">AlarmToDo</h1>
        </div>
        <AddTodoDialog onSave={onAddTodo}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New To-Do
          </Button>
        </AddTodoDialog>
      </div>
    </header>
  );
}
