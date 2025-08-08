'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { Bell, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ToDo } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AddTodoDialog } from './add-todo-dialog';

interface TodoCardProps {
  todo: ToDo;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (todo: ToDo) => void;
}

export function TodoCard({ todo, onToggleComplete, onDelete, onUpdate }: TodoCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-300 animate-in fade-in',
        todo.completed ? 'bg-card/50 border-dashed' : ''
      )}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <Checkbox
            id={`complete-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={() => onToggleComplete(todo.id)}
            className="mt-1.5 h-5 w-5"
            aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
          <div className="flex-1">
            <CardTitle
              className={cn(
                'font-headline text-lg',
                todo.completed && 'line-through text-muted-foreground'
              )}
            >
              {todo.title}
            </CardTitle>
            {todo.alarm && (
              <CardDescription
                className={cn(
                  'flex items-center gap-1.5 text-sm',
                  todo.completed
                    ? 'text-muted-foreground/80'
                    : new Date() > todo.alarm
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                <Bell className="h-4 w-4" />
                <span>
                  {format(todo.alarm, 'PPp')} ({formatDistanceToNow(todo.alarm, { addSuffix: true })})
                </span>
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      {todo.description && (
        <CardContent>
          <p
            className={cn(
              'text-sm text-muted-foreground',
              todo.completed && 'line-through'
            )}
          >
            {todo.description}
          </p>
        </CardContent>
      )}
      <div className="flex-grow" />
      <CardFooter className="flex justify-between items-end">
        <div className="flex flex-wrap gap-2">
          {todo.tags.map((tag) => (
            <Badge key={tag} variant={todo.completed ? "outline" : "secondary"}>
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
            {!todo.completed && 
                <AddTodoDialog onSave={(data) => onUpdate({ ...data, id: todo.id, completed: false })} todo={todo}>
                    <Button variant="ghost" size="icon" aria-label="Edit To-Do">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </Button>
                </AddTodoDialog>
            }
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive/70 hover:text-destructive"
            onClick={() => onDelete(todo.id)}
            aria-label="Delete To-Do"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
