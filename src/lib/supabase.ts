import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function query<T>(table: string, options?: {
  select?: string;
  filter?: { column: string; value: unknown }[];
  order?: { column: string; ascending?: boolean };
  single?: boolean;
}): Promise<T[]> {
  let queryBuilder = supabase.from(table).select(options?.select || '*');
  
  if (options?.filter) {
    for (const f of options.filter) {
      queryBuilder = queryBuilder.eq(f.column, f.value);
    }
  }
  
  if (options?.order) {
    queryBuilder = queryBuilder.order(options.order.column, { ascending: options.order.ascending ?? true });
  }
  
  const { data, error } = await queryBuilder;
  
  if (error) throw error;
  return (data || []) as T[];
}

export async function queryOne<T>(table: string, id: string): Promise<T | null> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as T | null;
}

export async function insert<T>(table: string, data: Partial<T>): Promise<T> {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result as T;
}

export async function update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return result as T;
}

export async function remove(table: string, id: string): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function rawQuery<T>(sql: string): Promise<T[]> {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) throw error;
  return (data || []) as T[];
}
