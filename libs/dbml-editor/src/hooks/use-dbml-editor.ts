import { useState, useEffect, useCallback } from 'react';
import { DbmlSchema } from '../types';

interface UseDbmlEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

interface UseDbmlEditorReturn {
  value: string;
  setValue: (value: string) => void;
  schema: DbmlSchema | null;
  error: string | null;
}

export const useDbmlEditor = ({
  initialValue = '',
  onChange,
}: UseDbmlEditorProps): UseDbmlEditorReturn => {
  const [value, setValue] = useState<string>(initialValue);
  const [schema, setSchema] = useState<DbmlSchema | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse DBML to schema
  const parseDbml = useCallback(async (dbmlCode: string) => {
    try {
      // We'll use dynamic import to avoid issues with SSR
      const { parseDBML } = await import('../utils/dbml-parser');
      const parsedSchema = parseDBML(dbmlCode);
      setSchema(parsedSchema);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error parsing DBML');
      }
      // Keep the previous schema if there's an error
    }
  }, []);

  // Update value and trigger onChange
  const handleValueChange = useCallback((newValue: string) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    parseDbml(newValue);
  }, [onChange, parseDbml]);

  // Initialize
  useEffect(() => {
    if (initialValue) {
      handleValueChange(initialValue);
    }
  }, [initialValue, handleValueChange]);

  return {
    value,
    setValue: handleValueChange,
    schema,
    error,
  };
}; 