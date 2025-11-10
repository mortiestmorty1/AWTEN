import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export default function Input(props: InputProps) {
  const { className, ...rest } = props;

  return (
    <input
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      className={cn(
        'h-10 w-full rounded-lg border border-awten-dark-300 bg-transparent px-3.5 text-sm font-medium text-awten-dark-900 outline-none placeholder:text-awten-dark-500 hover:border-awten-500 focus:border-awten-500 disabled:cursor-default disabled:opacity-50',
        className
      )}
      {...rest}
    />
  );
}
