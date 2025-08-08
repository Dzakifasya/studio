'use client';

import { useState, type ReactNode, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Bell,
  Calendar as CalendarIcon,
  LoaderCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { suggestTags } from '@/ai/flows/suggest-tags';
import type { ToDo } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  alarmDate: z.date().optional(),
  alarmTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTodoDialogProps {
  children: ReactNode;
  onSave: (data: Omit<ToDo, 'id' | 'completed'>) => void;
  todo?: ToDo;
}

export function AddTodoDialog({ children, onSave, todo }: AddTodoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const defaultValues: Partial<FormValues> = todo
    ? {
        title: todo.title,
        description: todo.description,
        alarmDate: todo.alarm || undefined,
        alarmTime: todo.alarm ? format(todo.alarm, 'HH:mm') : undefined,
        tags: todo.tags,
      }
    : {
        title: '',
        description: '',
        tags: [],
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const tags = form.watch('tags') || [];

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, todo]);

  const onSubmit = (data: FormValues) => {
    let alarm: Date | null = null;
    if (data.alarmDate) {
      alarm = new Date(data.alarmDate);
      if (data.alarmTime) {
        const [hours, minutes] = data.alarmTime.split(':').map(Number);
        alarm.setHours(hours, minutes, 0, 0);
      }
    }

    onSave({
      title: data.title,
      description: data.description || '',
      alarm,
      tags: data.tags || [],
    });
    setIsOpen(false);
  };

  const handleSuggestTags = async () => {
    const { title, description } = form.getValues();
    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Title is required',
        description: 'Please add a title before suggesting tags.',
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestTags({ title, description: description || '' });
      const currentTags = form.getValues('tags') || [];
      const newTags = result.tags.filter((tag) => !currentTags.includes(tag) && tag.trim() !== '');
      if(newTags.length > 0) {
        form.setValue('tags', [...currentTags, ...newTags]);
      } else {
         toast({
          title: 'No new tags suggested',
        });
      }
    } catch (error) {
      console.error('Failed to suggest tags:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not suggest tags at this time.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const newTag = input.value.trim();
      if (newTag && !tags.includes(newTag)) {
        form.setValue('tags', [...tags, newTag]);
      }
      input.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', tags.filter((tag) => tag !== tagToRemove));
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{todo ? 'Edit To-Do' : 'Add New To-Do'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Finish project report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="alarmDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Alarm Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alarmTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Alarm Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
               <div className="flex items-center justify-between">
                <FormLabel>Tags</FormLabel>
                <Button variant="ghost" size="sm" type="button" onClick={handleSuggestTags} disabled={isSuggesting}>
                  {isSuggesting ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4 text-accent" />
                  )}
                  Suggest
                </Button>
              </div>
              <FormControl>
                <div>
                   <div className="flex flex-wrap gap-2 rounded-md border border-input p-2 min-h-[40px]">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="rounded-full hover:bg-muted-foreground/20">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <Input
                        ref={tagInputRef}
                        type="text"
                        placeholder="Add tags..."
                        className="flex-1 border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                        onKeyDown={handleTagInput}
                      />
                    </div>
                </div>
              </FormControl>
            </FormItem>

            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                <Bell className="mr-2 h-4 w-4" />
                {todo ? 'Save Changes' : 'Set AlarmToDo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
