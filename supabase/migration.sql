-- =====================================================
-- SHOPPING APP — Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Stores
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT NOT NULL DEFAULT '🏪',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products (user's product database for autocomplete)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  default_unit TEXT NOT NULL DEFAULT 'szt',
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shopping Lists
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- List Items
CREATE TABLE IF NOT EXISTS public.list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'szt',
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- List Templates
CREATE TABLE IF NOT EXISTS public.list_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template Items
CREATE TABLE IF NOT EXISTS public.template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.list_templates(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'szt'
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(user_id, name);
CREATE INDEX IF NOT EXISTS idx_products_usage ON public.products(user_id, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_store ON public.shopping_lists(store_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON public.shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_status ON public.shopping_lists(user_id, status);
CREATE INDEX IF NOT EXISTS idx_list_items_list ON public.list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_templates_user ON public.list_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_template_items_template ON public.template_items(template_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_items ENABLE ROW LEVEL SECURITY;

-- Stores: users can only access their own stores
CREATE POLICY "Users can view own stores"
  ON public.stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stores"
  ON public.stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stores"
  ON public.stores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stores"
  ON public.stores FOR DELETE
  USING (auth.uid() = user_id);

-- Products: users can only access their own products
CREATE POLICY "Users can view own products"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- Shopping Lists: users can only access their own lists
CREATE POLICY "Users can view own lists"
  ON public.shopping_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists"
  ON public.shopping_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON public.shopping_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON public.shopping_lists FOR DELETE
  USING (auth.uid() = user_id);

-- List Items: users can access items belonging to their lists
CREATE POLICY "Users can view own list items"
  ON public.list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE shopping_lists.id = list_items.list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own list items"
  ON public.list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE shopping_lists.id = list_items.list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own list items"
  ON public.list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE shopping_lists.id = list_items.list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own list items"
  ON public.list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE shopping_lists.id = list_items.list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- List Templates: users can only access their own templates
CREATE POLICY "Users can view own templates"
  ON public.list_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates"
  ON public.list_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.list_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.list_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Template Items: users can access items belonging to their templates
CREATE POLICY "Users can view own template items"
  ON public.template_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.list_templates
      WHERE list_templates.id = template_items.template_id
      AND list_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own template items"
  ON public.template_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.list_templates
      WHERE list_templates.id = template_items.template_id
      AND list_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own template items"
  ON public.template_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.list_templates
      WHERE list_templates.id = template_items.template_id
      AND list_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own template items"
  ON public.template_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.list_templates
      WHERE list_templates.id = template_items.template_id
      AND list_templates.user_id = auth.uid()
    )
  );
