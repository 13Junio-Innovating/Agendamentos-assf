DO $$
BEGIN
  -- Verifica se as tabelas existem
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE EXCEPTION 'Tabela users não existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    RAISE EXCEPTION 'Tabela appointments não existe';
  END IF;
  
  -- Verifica colunas da tabela users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role' AND data_type = 'character varying'
  ) THEN
    RAISE EXCEPTION 'Coluna role na tabela users não está correta';
  END IF;
  
  -- Verifica constraints
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'users_role_check'
  ) THEN
    RAISE EXCEPTION 'Constraint de role na tabela users não existe';
  END IF;
  
  RAISE NOTICE 'Banco de dados parece estar configurado corretamente';
END $$;