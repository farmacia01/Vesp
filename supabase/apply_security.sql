-- 1. CORREÇÃO DAS POLÍTICAS DA TABELA PROFILES (Remoção do Data Leak)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Admins can do everything on profiles" ON public.profiles TO authenticated USING (public.is_admin());
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);


-- 2. BLINDAGEM DAS FUNÇÕES (Prevenção de Injeção com search_path)

-- Função Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função Get User Client ID
CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS uuid AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Função Trigger: Handle New User
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 'client');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função Trigger: Client Created
CREATE OR REPLACE FUNCTION log_client_created() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.timeline_events (client_id, title, description)
  VALUES (new.id, 'Cliente cadastrado', 'O cliente ' || new.name || ' foi adicionado ao sistema.');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função Trigger: Client Edited
CREATE OR REPLACE FUNCTION log_client_edited() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.timeline_events (client_id, title, description)
  VALUES (new.id, 'Cadastro atualizado', 'Os dados do cliente foram atualizados.');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função Trigger: Task Completed
CREATE OR REPLACE FUNCTION log_task_completed() RETURNS trigger AS $$
BEGIN
  IF new.status = 'done' AND old.status != 'done' THEN
    INSERT INTO public.timeline_events (client_id, title, description)
    VALUES (new.client_id, 'Tarefa concluída', 'A tarefa "' || new.title || '" foi finalizada.');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função Trigger: Invoice Paid
CREATE OR REPLACE FUNCTION log_invoice_paid() RETURNS trigger AS $$
BEGIN
  IF new.status = 'paid' AND old.status != 'paid' THEN
    INSERT INTO public.timeline_events (client_id, title, description)
    VALUES (new.client_id, 'Pagamento registrado', 'O pagamento no valor de R$ ' || new.amount || ' foi confirmado.');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
