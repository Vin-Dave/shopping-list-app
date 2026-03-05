export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          color?: string;
          icon?: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string | null;
          default_unit: string;
          usage_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          category?: string | null;
          default_unit?: string;
          usage_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string | null;
          default_unit?: string;
          usage_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      shopping_lists: {
        Row: {
          id: string;
          store_id: string;
          user_id: string;
          title: string | null;
          status: 'active' | 'completed' | 'archived';
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          user_id?: string;
          title?: string | null;
          status?: 'active' | 'completed' | 'archived';
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          user_id?: string;
          title?: string | null;
          status?: 'active' | 'completed' | 'archived';
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'shopping_lists_store_id_fkey';
            columns: ['store_id'];
            isOneToOne: false;
            referencedRelation: 'stores';
            referencedColumns: ['id'];
          },
        ];
      };
      list_items: {
        Row: {
          id: string;
          list_id: string;
          product_id: string | null;
          name: string;
          quantity: number;
          unit: string;
          is_checked: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          product_id?: string | null;
          name: string;
          quantity?: number;
          unit?: string;
          is_checked?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          product_id?: string | null;
          name?: string;
          quantity?: number;
          unit?: string;
          is_checked?: boolean;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'list_items_list_id_fkey';
            columns: ['list_id'];
            isOneToOne: false;
            referencedRelation: 'shopping_lists';
            referencedColumns: ['id'];
          },
        ];
      };
      list_templates: {
        Row: {
          id: string;
          user_id: string;
          store_id: string | null;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          store_id?: string | null;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_id?: string | null;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      template_items: {
        Row: {
          id: string;
          template_id: string;
          product_id: string | null;
          name: string;
          quantity: number;
          unit: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          product_id?: string | null;
          name: string;
          quantity?: number;
          unit?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          product_id?: string | null;
          name?: string;
          quantity?: number;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'template_items_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'list_templates';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Store = Database['public']['Tables']['stores']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ShoppingList = Database['public']['Tables']['shopping_lists']['Row'];
export type ListItem = Database['public']['Tables']['list_items']['Row'];
export type ListTemplate = Database['public']['Tables']['list_templates']['Row'];
export type TemplateItem = Database['public']['Tables']['template_items']['Row'];
